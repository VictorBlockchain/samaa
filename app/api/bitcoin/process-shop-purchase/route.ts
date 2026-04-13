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
    const { userId, orderId, totalAmount } = body

    if (!userId || !orderId || !totalAmount) {
      return NextResponse.json(
        { error: 'userId, orderId, and totalAmount are required' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-shop-purchase] Processing shop order ${orderId} for $${totalAmount}`)

    // Get current BTC price
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    const btcData = await response.json()
    const btcPrice = btcData.bitcoin.usd

    // Convert USD to satoshis
    const amountSatoshis = Math.ceil((totalAmount / btcPrice) * 100000000)

    // Get user's wallet data
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('btc_address, btc_private_key_encrypted, btc_balance_satoshis')
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

    // Get payout addresses
    const { data: settingsData } = await supabaseAdmin
      .from('admin_settings')
      .select('shop_split_percentage, community_split_percentage, admin_payout_address, community_btc_address')
      .limit(1)
      .maybeSingle()

    const adminAddress = settingsData?.admin_payout_address || process.env.ADMIN_BTC_ADDRESS
    const communityAddress = settingsData?.community_btc_address || process.env.COMMUNITY_BTC_ADDRESS
    const shopSplit = settingsData?.shop_split_percentage || 5

    if (!adminAddress || !communityAddress) {
      console.error('[bitcoin-shop-purchase] Missing payout addresses')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    // Calculate splits
    const adminSatoshis = Math.floor(amountSatoshis * 0.10) // 10% admin fee
    const communitySplit = settingsData?.community_split_percentage || 10
    const communitySatoshis = Math.floor(amountSatoshis * (communitySplit / 100))
    const shopSatoshis = Math.floor(amountSatoshis * (shopSplit / 100))
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

    console.log(`[bitcoin-shop-purchase] Creating split transaction:`)
    console.log(`  - Order total: ${amountSatoshis} satoshis`)
    console.log(`  - Admin fee: ${adminSatoshis} satoshis to ${adminAddress}`)
    console.log(`  - Community: ${communitySatoshis} satoshis to ${communityAddress}`)
    console.log(`  - Shop: ${shopSatoshis} satoshis to shop owner`)
    console.log(`  - Network fee: ${feeSatoshis} satoshis`)

    // Get shop owner's Bitcoin address
    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('shop_id')
      .eq('id', orderId)
      .single()

    if (!orderData?.shop_id) {
      return NextResponse.json(
        { error: 'Order not found or missing shop ID' },
        { status: 404 }
      )
    }

    const { data: shopData } = await supabaseAdmin
      .from('shops')
      .select('user_id, bitcoin_address')
      .eq('id', orderData.shop_id)
      .single()

    if (!shopData) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    const shopOwnerAddress = shopData.bitcoin_address
    if (!shopOwnerAddress) {
      return NextResponse.json(
        { error: 'Shop owner does not have a Bitcoin address configured' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-shop-purchase] Shop owner address: ${shopOwnerAddress}`)

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

    // Create split transaction outputs (admin + community + shop owner)
    const outputs = [
      { address: adminAddress, amountSatoshis: adminSatoshis },
      { address: communityAddress, amountSatoshis: communitySatoshis },
      { address: shopOwnerAddress, amountSatoshis: shopSatoshis },
    ]

    // Create and sign transaction
    const txHex = await createSplitTransaction(
      privateKeyWIF,
      userData.btc_address,
      outputs,
      utxos,
      feeSatoshis
    )

    console.log(`[bitcoin-shop-purchase] Transaction created, broadcasting...`)

    // Broadcast transaction
    const txId = await broadcastTransaction(txHex)

    console.log(`[bitcoin-shop-purchase] Transaction broadcast: ${txId}`)

    // Update order as paid with Bitcoin
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'completed',
        payment_method: 'bitcoin_onchain',
        payment_completed_at: new Date().toISOString(),
        stripe_session_id: null,
        stripe_payment_intent_id: null,
        status: 'confirmed',
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('[bitcoin-shop-purchase] Error updating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Create payment record
    const communityContribution = parseFloat((communitySatoshis / 100000000 * btcPrice).toFixed(2))
    const platformFee = parseFloat((adminSatoshis / 100000000 * btcPrice).toFixed(2))
    const shopOwnerPayment = parseFloat((shopSatoshis / 100000000 * btcPrice).toFixed(2))

    const { error: paymentError } = await supabaseAdmin
      .from('user_payments')
      .insert({
        user_id: userId,
        amount: totalAmount,
        currency: 'usd',
        status: 'succeeded',
        type: 'product',
        community_contribution: communityContribution,
        platform_fee: platformFee,
        metadata: {
          method: 'bitcoin_onchain',
          payment_type: 'shop_purchase',
          amount_satoshis: amountSatoshis,
          btc_price: btcPrice,
          tx_id: txId,
          order_id: orderId,
          admin_satoshis: adminSatoshis,
          community_satoshis: communitySatoshis,
          shop_satoshis: shopSatoshis,
          shop_owner_address: shopOwnerAddress,
          fee_satoshis: feeSatoshis,
        },
      })

    if (paymentError) {
      console.error('[bitcoin-shop-purchase] Error creating payment record:', paymentError)
    }

    // Update user balance after successful payment
    const newBalance = actualBalance - totalRequired
    await supabaseAdmin
      .from('users')
      .update({
        btc_balance_satoshis: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    // Get user and shop owner data for emails
    const { data: buyerData } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', userId)
      .single()

    const { data: shopOwnerData } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', shopData.user_id)
      .single()

    // Send email notifications
    const { sendEmail } = await import('@/lib/mailgun')

    // Email to buyer
    if (buyerData?.email) {
      try {
        await sendEmail({
          to: buyerData.email,
          subject: 'Your Shop Order Confirmation 🎉',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Order Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333;">Assalamu alaikum ${buyerData.first_name || 'there'},</p>
                  <p style="font-size: 16px; color: #333;">
                    Your order has been successfully paid with Bitcoin and confirmed.
                  </p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #667eea;">Order Details:</h3>
                    <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
                    <p style="margin: 8px 0;"><strong>Amount:</strong> $${totalAmount.toFixed(2)} USD</p>
                    <p style="margin: 8px 0;"><strong>Payment Method:</strong> Bitcoin</p>
                    <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${txId}</p>
                  </div>
                  <p style="font-size: 16px; color: #333;">
                    You can track your order status in your account.
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Best regards,<br>
                    The Samaa Team
                  </p>
                </div>
              </body>
            </html>
          `,
        })
        console.log(`[bitcoin-shop-purchase] Buyer confirmation email sent to ${buyerData.email}`)
      } catch (emailError) {
        console.error('[bitcoin-shop-purchase] Error sending buyer email:', emailError)
      }
    }

    // Email to shop owner
    if (shopOwnerData?.email) {
      try {
        const shopOwnerShare = parseFloat((shopSatoshis / 100000000 * btcPrice).toFixed(2))
        
        await sendEmail({
          to: shopOwnerData.email,
          subject: 'New Order Received! 💰',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>New Order Notification</title>
              </head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">New Order!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333;">Assalamu alaikum ${shopOwnerData.first_name || 'there'},</p>
                  <p style="font-size: 16px; color: #333;">
                    You have a new order that has been paid and confirmed.
                  </p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #10b981;">Order Details:</h3>
                    <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
                    <p style="margin: 8px 0;"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)} USD</p>
                    <p style="margin: 8px 0;"><strong>Your Share:</strong> $${shopOwnerShare.toFixed(2)} USD</p>
                    <p style="margin: 8px 0;"><strong>Payment Method:</strong> Bitcoin</p>
                    <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${txId}</p>
                  </div>
                  <p style="font-size: 16px; color: #333;">
                    Please process this order and update the shipping status in your shop dashboard.
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    The payment has been sent to your Bitcoin wallet.
                  </p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Best regards,<br>
                    The Samaa Team
                  </p>
                </div>
              </body>
            </html>
          `,
        })
        console.log(`[bitcoin-shop-purchase] Shop owner notification email sent to ${shopOwnerData.email}`)
      } catch (emailError) {
        console.error('[bitcoin-shop-purchase] Error sending shop owner email:', emailError)
      }
    }

    console.log(`[bitcoin-shop-purchase] Payment successful! New balance: ${newBalance}`)

    return NextResponse.json({
      success: true,
      data: {
        newBalance,
        amountSatoshis,
        txId,
        orderId,
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-shop-purchase] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}
