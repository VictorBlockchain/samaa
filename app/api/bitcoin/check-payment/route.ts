import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkPayment } from '@/lib/bitcoin'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-check] Checking payment: ${paymentId}`)

    // Get payment details
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('bitcoin_payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if already confirmed
    if (payment.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        paid: true,
        txid: payment.txid,
        paymentId: payment.id,
        paymentType: payment.payment_type,
      })
    }

    // Check if expired
    if (new Date(payment.expires_at) < new Date()) {
      await supabaseAdmin
        .from('bitcoin_payments')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', paymentId)

      return NextResponse.json({
        success: true,
        paid: false,
        expired: true,
      })
    }

    // Check blockchain for payment
    const paymentStatus = await checkPayment(payment.bitcoin_address, payment.amount_satoshis)

    console.log(`[bitcoin-check] Payment status:`, paymentStatus)

    if (paymentStatus.paid) {
      // Confirm payment and credit user
      const { data: result, error: confirmError } = await supabaseAdmin.rpc(
        'confirm_bitcoin_payment',
        {
          p_payment_id: paymentId,
          p_txid: paymentStatus.txid,
        }
      )

      if (confirmError) {
        console.error('[bitcoin-check] Error confirming payment:', confirmError)
        return NextResponse.json(
          { error: 'Failed to confirm payment' },
          { status: 500 }
        )
      }

      console.log(`[bitcoin-check] Payment confirmed: ${paymentStatus.txid}`)

      return NextResponse.json({
        success: true,
        paid: true,
        txid: paymentStatus.txid,
        paymentId: payment.id,
        paymentType: payment.payment_type,
        ...result,
      })
    }

    return NextResponse.json({
      success: true,
      paid: false,
      confirmations: paymentStatus.confirmations,
    })
  } catch (error: any) {
    console.error('[bitcoin-check] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check payment' },
      { status: 500 }
    )
  }
}
