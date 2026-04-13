import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deriveAddress, fetchBTCPrice, usdToSatoshis, generateBitcoinURI } from '@/lib/bitcoin'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, paymentType, amount, promoCodeId, referredBy } = body

    // Validate required fields
    if (!userId || !paymentType || !amount) {
      return NextResponse.json(
        { error: 'userId, paymentType, and amount are required' },
        { status: 400 }
      )
    }

    // Validate payment type
    if (!['subscription', 'views', 'leads'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Invalid payment type. Must be subscription, views, or leads' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-payment] Creating payment: ${paymentType} for $${amount}`)

    // Get current BTC price
    const btcPrice = await fetchBTCPrice()
    console.log(`[bitcoin-payment] BTC price: $${btcPrice}`)

    // Convert USD to satoshis
    const amountSatoshis = usdToSatoshis(amount, btcPrice)
    console.log(`[bitcoin-payment] Amount in satoshis: ${amountSatoshis}`)

    // Get or create Bitcoin address for user
    let addressIndex: number
    let bitcoinAddress: string

    // Check if user has a pending payment (reuse address)
    const { data: pendingPayment } = await supabaseAdmin
      .from('bitcoin_payments')
      .select('bitcoin_address, derivation_index')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (pendingPayment) {
      // Reuse existing address
      addressIndex = pendingPayment.derivation_index
      bitcoinAddress = pendingPayment.bitcoin_address
      console.log(`[bitcoin-payment] Reusing pending address: ${bitcoinAddress}`)
    } else {
      // Generate new address
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('last_btc_address_index')
        .eq('id', userId)
        .single()

      addressIndex = (userData?.last_btc_address_index || 0) + 1
      bitcoinAddress = deriveAddress(process.env.XPUB_KEY!, addressIndex)
      console.log(`[bitcoin-payment] Generated new address: ${bitcoinAddress} (index: ${addressIndex})`)

      // Update user's address index
      await supabaseAdmin
        .from('users')
        .update({ last_btc_address_index: addressIndex })
        .eq('id', userId)
    }

    // Determine what user gets
    let subscriptionMonths = 0
    let viewsAmount = 0
    let leadsAmount = 0

    if (paymentType === 'subscription') {
      subscriptionMonths = amount >= 50 ? 12 : 1 // $50+ = yearly, otherwise monthly
    } else if (paymentType === 'views') {
      viewsAmount = Math.floor(amount * 10) // $1 = 10 views
    } else if (paymentType === 'leads') {
      leadsAmount = Math.floor(amount * 5) // $1 = 5 leads
    }

    // Create payment record
    const { data: payment, error } = await supabaseAdmin
      .from('bitcoin_payments')
      .insert({
        user_id: userId,
        payment_type: paymentType,
        amount_usd: amount,
        amount_satoshis: amountSatoshis,
        btc_price_usd: btcPrice,
        bitcoin_address: bitcoinAddress,
        derivation_index: addressIndex,
        status: 'pending',
        subscription_months: subscriptionMonths,
        views_amount: viewsAmount,
        leads_amount: leadsAmount,
        promo_code_id: promoCodeId || null,
        referred_by: referredBy || null,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      })
      .select()
      .single()

    if (error) {
      console.error('[bitcoin-payment] Error creating payment:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Generate Bitcoin URI
    const bitcoinURI = generateBitcoinURI(
      bitcoinAddress,
      amountSatoshis,
      `Samaa ${paymentType} payment`
    )

    console.log(`[bitcoin-payment] Payment created: ${payment.id}`)

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        bitcoinAddress,
        amountSatoshis,
        amountBTC: (amountSatoshis / 100000000).toFixed(8),
        amountUSD: amount,
        btcPrice,
        bitcoinURI,
        expiresAt: payment.expires_at,
        paymentType,
        subscriptionMonths,
        viewsAmount,
        leadsAmount,
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-payment] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
