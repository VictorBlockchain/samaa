import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  getDecryptedPrivateKey, 
  getUTXOs, 
  createSplitTransaction, 
  broadcastTransaction,
  getAddressBalance 
} from '@/lib/bitcoin-split'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, paymentType, amountUSD } = body

    if (!userId || !paymentType || !amountUSD) {
      return NextResponse.json(
        { error: 'userId, paymentType, and amountUSD are required' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-purchase] Processing ${paymentType} purchase for $${amountUSD}`)

    // Get current BTC price
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    const btcData = await response.json()
    const btcPrice = btcData.bitcoin.usd

    // Convert USD to satoshis
    const amountSatoshis = Math.ceil((amountUSD / btcPrice) * 100000000)

    // Get user's wallet data
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('btc_address, btc_private_key_encrypted, btc_balance_satoshis, gender')
      .eq('id', userId)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userData.btc_address || !userData.btc_private_key_encrypted) {
      return NextResponse.json(
        { error: 'User does not have a Bitcoin wallet' },
        { status: 400 }
      )
    }

    const currentBalance = userData.btc_balance_satoshis || 0

    // Check if user has enough balance
    if (currentBalance < amountSatoshis) {
      return NextResponse.json(
        { 
          success: false, 
          insufficient: true,
          currentBalance,
          requiredBalance: amountSatoshis,
          deficit: amountSatoshis - currentBalance,
        },
        { status: 402 } // Payment Required
      )
    }

    // Get admin and community payout addresses
    const { data: settingsData } = await supabaseAdmin
      .from('admin_settings')
      .select('community_split_percentage, admin_payout_address, community_btc_address')
      .limit(1)
      .maybeSingle()

    const adminAddress = settingsData?.admin_payout_address || process.env.ADMIN_BTC_ADDRESS
    const communityAddress = settingsData?.community_btc_address || process.env.COMMUNITY_BTC_ADDRESS
    const communitySplit = settingsData?.community_split_percentage || 10

    if (!adminAddress || !communityAddress) {
      console.error('[bitcoin-purchase] Missing payout addresses')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    // Calculate splits
    const adminSatoshis = Math.floor(amountSatoshis * 0.10) // 10% admin fee
    const communitySatoshis = Math.floor(amountSatoshis * (communitySplit / 100))
    const feeSatoshis = 2000 // Network fee estimate
    const totalRequired = amountSatoshis + feeSatoshis

    // Verify actual blockchain balance
    const actualBalance = await getAddressBalance(userData.btc_address)
    if (actualBalance < totalRequired) {
      return NextResponse.json(
        { 
          error: 'Insufficient confirmed blockchain balance',
          actualBalance,
          requiredBalance: totalRequired,
        },
        { status: 402 }
      )
    }

    console.log(`[bitcoin-purchase] Creating split transaction:`)
    console.log(`  - User payment: ${amountSatoshis} satoshis`)
    console.log(`  - Admin fee: ${adminSatoshis} satoshis to ${adminAddress}`)
    console.log(`  - Community: ${communitySatoshis} satoshis to ${communityAddress}`)
    console.log(`  - Network fee: ${feeSatoshis} satoshis`)

    // Decrypt user's private key
    const privateKeyWIF = getDecryptedPrivateKey(userData.btc_private_key_encrypted)

    // Get UTXOs
    const utxos = await getUTXOs(userData.btc_address)
    if (utxos.length === 0) {
      return NextResponse.json(
        { error: 'No UTXOs available for transaction' },
        { status: 400 }
      )
    }

    // Create split transaction outputs
    const outputs = [
      { address: adminAddress, amountSatoshis: adminSatoshis },
      { address: communityAddress, amountSatoshis: communitySatoshis },
    ]

    // Create and sign transaction
    const txHex = await createSplitTransaction(
      privateKeyWIF,
      userData.btc_address,
      outputs,
      utxos,
      feeSatoshis
    )

    console.log(`[bitcoin-purchase] Transaction created, broadcasting...`)

    // Broadcast transaction
    const txId = await broadcastTransaction(txHex)

    console.log(`[bitcoin-purchase] Transaction broadcast: ${txId}`)

    // Determine what user gets
    let subscriptionMonths = 0
    let viewsAmount = 0
    let leadsAmount = 0
    let isFirstSubscription = false

    if (paymentType === 'subscription') {
      subscriptionMonths = amountUSD >= 50 ? 12 : 1
      
      // Check if user has any previous subscription payments
      const { data: previousSubscriptions } = await supabaseAdmin
        .from('user_payments')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'subscription')
        .limit(1)

      isFirstSubscription = !previousSubscriptions || previousSubscriptions.length === 0
    } else if (paymentType === 'views') {
      viewsAmount = Math.floor(amountUSD * 10)
    } else if (paymentType === 'leads') {
      leadsAmount = Math.floor(amountUSD * 5)
    }

    // Check if this is first subscription payment and handle referral bonus
    let referralBonusPaid = false
    let referrerId = null
    let referrerBonusAmount = 0
    let referrerViewsBonus = 0

    if (paymentType === 'subscription' && isFirstSubscription) {
      // Check if user was referred
      const { data: userData_full } = await supabaseAdmin
        .from('users')
        .select('referred_by')
        .eq('id', userId)
        .single()

      if (userData_full?.referred_by) {
        referrerId = userData_full.referred_by
        referrerBonusAmount = 10 // $10 USD equivalent in satoshis
        referrerViewsBonus = 15 // 15 bonus views

        console.log(`[bitcoin-purchase] First subscription! Paying referral bonus to ${referrerId}`)

        // Get referrer's current data
        const { data: referrerData } = await supabaseAdmin
          .from('users')
          .select('btc_address, available_views, cash_awarded')
          .eq('id', referrerId)
          .single()

        if (referrerData) {
          // Calculate $10 in satoshis
          const bonusSatoshis = Math.ceil((10 / btcPrice) * 100000000)

          // Update referrer with bonus
          const { error: referrerError } = await supabaseAdmin
            .from('users')
            .update({
              available_views: (referrerData.available_views || 0) + referrerViewsBonus,
              cash_awarded: (referrerData.cash_awarded || 0) + 10,
              updated_at: new Date().toISOString(),
            })
            .eq('id', referrerId)

          if (referrerError) {
            console.error('[bitcoin-purchase] Error updating referrer:', referrerError)
          } else {
            referralBonusPaid = true
            console.log(`[bitcoin-purchase] Referral bonus paid: $10 + 15 views to ${referrerId}`)
          }
        }
      }
    }

    // Get current views/leads
    const { data: currentData } = await supabaseAdmin
      .from('users')
      .select('available_views, available_leads')
      .eq('id', userId)
      .single()

    // Update user with new balance and credits
    const newBalance = actualBalance - totalRequired
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        btc_balance_satoshis: newBalance,
        available_views: (currentData?.available_views || 0) + viewsAmount,
        available_leads: (currentData?.available_leads || 0) + leadsAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[bitcoin-purchase] Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to process purchase' },
        { status: 500 }
      )
    }

    // Create payment record
    const communityContribution = parseFloat((communitySatoshis / 100000000 * btcPrice).toFixed(2))
    const platformFee = parseFloat((adminSatoshis / 100000000 * btcPrice).toFixed(2))

    const { error: paymentError } = await supabaseAdmin
      .from('user_payments')
      .insert({
        user_id: userId,
        amount: amountUSD,
        currency: 'usd',
        status: 'succeeded',
        type: paymentType,
        community_contribution: communityContribution,
        platform_fee: platformFee,
        metadata: {
          method: 'bitcoin_onchain',
          payment_type: paymentType,
          amount_satoshis: amountSatoshis,
          btc_price: btcPrice,
          tx_id: txId,
          admin_satoshis: adminSatoshis,
          community_satoshis: communitySatoshis,
          fee_satoshis: feeSatoshis,
          // Subscription-specific
          subscription_months: paymentType === 'subscription' ? subscriptionMonths : undefined,
          is_first_subscription: paymentType === 'subscription' ? isFirstSubscription : undefined,
          // Views-specific
          views_purchased: paymentType === 'views' ? viewsAmount : undefined,
          // Leads-specific
          leads_purchased: paymentType === 'leads' ? leadsAmount : undefined,
          // Referral bonus (if applicable)
          referral_bonus_paid: referralBonusPaid || undefined,
          referrer_id: referrerId || undefined,
          referrer_bonus_satoshis: referralBonusPaid ? Math.ceil((10 / btcPrice) * 100000000) : undefined,
          referrer_views_bonus: referralBonusPaid ? referrerViewsBonus : undefined,
        },
      })

    if (paymentError) {
      console.error('[bitcoin-purchase] Error creating payment record:', paymentError)
    }

    // Send email notifications
    try {
      const { sendEmail } = await import('@/lib/mailgun')
      
      // Get user email
      const { data: userEmailData } = await supabaseAdmin
        .from('users')
        .select('email, first_name')
        .eq('id', userId)
        .single()

      if (userEmailData?.email) {
        let emailSubject = ''
        let emailHTML = ''

        if (paymentType === 'subscription') {
          emailSubject = isFirstSubscription ? 'Welcome to Samaa Premium! 🌟' : 'Your Subscription Has Been Renewed ✨'
          emailHTML = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Subscription Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">${isFirstSubscription ? 'Welcome to Premium!' : 'Subscription Renewed!'}</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333;">Assalamu alaikum ${userEmailData.first_name || 'there'},</p>
                  <p style="font-size: 16px; color: #333;">
                    ${isFirstSubscription 
                      ? 'Welcome to Samaa Premium! Your subscription is now active.'
                      : 'Your Samaa Premium subscription has been renewed successfully.'}
                  </p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #667eea;">Subscription Details:</h3>
                    <p style="margin: 8px 0;"><strong>Duration:</strong> ${subscriptionMonths} month${subscriptionMonths > 1 ? 's' : ''}</p>
                    <p style="margin: 8px 0;"><strong>Amount:</strong> $${amountUSD.toFixed(2)} USD</p>
                    <p style="margin: 8px 0;"><strong>Payment Method:</strong> Bitcoin</p>
                    <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${txId}</p>
                  </div>
                  <p style="font-size: 16px; color: #333;">
                    You now have access to all Premium features. Enjoy exploring potential matches!
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Best regards,<br>
                    The Samaa Team
                  </p>
                </div>
              </body>
            </html>
          `
        } else if (paymentType === 'views') {
          emailSubject = 'Views Package Activated 👀'
          emailHTML = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Views Purchase Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Views Added!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333;">Assalamu alaikum ${userEmailData.first_name || 'there'},</p>
                  <p style="font-size: 16px; color: #333;">
                    Your views package has been successfully activated.
                  </p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #667eea;">Purchase Details:</h3>
                    <p style="margin: 8px 0;"><strong>Views Added:</strong> ${viewsAmount}</p>
                    <p style="margin: 8px 0;"><strong>Amount:</strong> $${amountUSD.toFixed(2)} USD</p>
                    <p style="margin: 8px 0;"><strong>Payment Method:</strong> Bitcoin</p>
                    <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${txId}</p>
                  </div>
                  <p style="font-size: 16px; color: #333;">
                    Start viewing profiles and find your perfect match!
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Best regards,<br>
                    The Samaa Team
                  </p>
                </div>
              </body>
            </html>
          `
        } else if (paymentType === 'leads') {
          emailSubject = 'Leads Package Activated 🎯'
          emailHTML = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Leads Purchase Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Leads Added!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333;">Assalamu alaikum ${userEmailData.first_name || 'there'},</p>
                  <p style="font-size: 16px; color: #333;">
                    Your leads package has been successfully activated.
                  </p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #667eea;">Purchase Details:</h3>
                    <p style="margin: 8px 0;"><strong>Leads Added:</strong> ${leadsAmount}</p>
                    <p style="margin: 8px 0;"><strong>Amount:</strong> $${amountUSD.toFixed(2)} USD</p>
                    <p style="margin: 8px 0;"><strong>Payment Method:</strong> Bitcoin</p>
                    <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${txId}</p>
                  </div>
                  <p style="font-size: 16px; color: #333;">
                    Connect with potential matches who are interested in you!
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Best regards,<br>
                    The Samaa Team
                  </p>
                </div>
              </body>
            </html>
          `
        }

        if (emailSubject && emailHTML) {
          await sendEmail({
            to: userEmailData.email,
            subject: emailSubject,
            html: emailHTML,
          })
          console.log(`[bitcoin-purchase] Confirmation email sent to ${userEmailData.email}`)
        }
      }

      // Send referral bonus email if applicable
      if (referralBonusPaid && referrerId) {
        const { data: referrerEmailData } = await supabaseAdmin
          .from('users')
          .select('email, first_name')
          .eq('id', referrerId)
          .single()

        if (referrerEmailData?.email) {
          const referralEmailHTML = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Referral Bonus Received</title>
              </head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Referral Bonus! 🎉</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333;">Assalamu alaikum ${referrerEmailData.first_name || 'there'},</p>
                  <p style="font-size: 16px; color: #333;">
                    Great news! Someone you referred has just subscribed to Samaa Premium.
                  </p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #10b981;">Your Referral Bonus:</h3>
                    <p style="margin: 8px 0;"><strong>Cash Bonus:</strong> $10.00 USD</p>
                    <p style="margin: 8px 0;"><strong>Bonus Views:</strong> ${referrerViewsBonus}</p>
                    <p style="margin: 8px 0; color: #666; font-size: 14px;">These have been added to your account.</p>
                  </div>
                  <p style="font-size: 16px; color: #333;">
                    Keep sharing Samaa with your friends and family to earn more bonuses!
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Best regards,<br>
                    The Samaa Team
                  </p>
                </div>
              </body>
            </html>
          `

          await sendEmail({
            to: referrerEmailData.email,
            subject: 'You Earned a Referral Bonus! 💰',
            html: referralEmailHTML,
          })
          console.log(`[bitcoin-purchase] Referral bonus email sent to ${referrerEmailData.email}`)
        }
      }
    } catch (emailError) {
      console.error('[bitcoin-purchase] Error sending emails:', emailError)
    }

    console.log(`[bitcoin-purchase] Purchase successful! New balance: ${newBalance}`)

    return NextResponse.json({
      success: true,
      data: {
        newBalance,
        amountSatoshis,
        txId,
        viewsAdded: viewsAmount,
        leadsAdded: leadsAmount,
        subscriptionMonths,
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-purchase] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
