import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, userId } = body

    if (!amount || !orderId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, userId' },
        { status: 400 }
      )
    }

    const result = await createPaymentIntent(parseFloat(amount), orderId, userId)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    })
  } catch (error) {
    console.error('Error in create-payment-intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
