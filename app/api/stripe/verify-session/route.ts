import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    console.log('[verify-session] Verifying session:', sessionId)

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log('[verify-session] Session status:', session.payment_status)

    // Check if payment was successful
    if (session.payment_status === 'paid' || session.status === 'complete') {
      return NextResponse.json({
        verified: true,
        type: session.metadata?.type || 'subscription',
        amount: session.amount_total ? session.amount_total / 100 : null,
        status: session.payment_status,
        customerId: session.customer,
      })
    }

    // Payment not completed
    return NextResponse.json({
      verified: false,
      reason: 'Payment not completed',
      status: session.payment_status,
    })
  } catch (error: any) {
    console.error('[verify-session] Error verifying session:', error)
    return NextResponse.json(
      { 
        verified: false, 
        error: error.message || 'Failed to verify payment' 
      },
      { status: 500 }
    )
  }
}
