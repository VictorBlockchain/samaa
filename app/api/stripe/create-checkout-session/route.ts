import { NextRequest, NextResponse } from 'next/server'
import { createLikesCheckoutSession, createComplimentsCheckoutSession, createSubscriptionCheckoutSession, getLikesProducts, getComplimentsProducts, getSubscriptionPlans } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, type, productId, planId } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userEmail' },
        { status: 400 }
      )
    }

    let checkoutUrl: string | null = null

    if (type === 'likes' && productId) {
      const products = await getLikesProducts()
      const product = products.find(p => p.id === productId)
      if (!product) {
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
      }
      checkoutUrl = await createLikesCheckoutSession(userId, userEmail, product)
    } else if (type === 'compliments' && productId) {
      const products = await getComplimentsProducts()
      const product = products.find(p => p.id === productId)
      if (!product) {
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
      }
      checkoutUrl = await createComplimentsCheckoutSession(userId, userEmail, product)
    } else if (type === 'subscription' && planId) {
      const plans = await getSubscriptionPlans()
      const plan = plans.find(p => p.id === planId)
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
      checkoutUrl = await createSubscriptionCheckoutSession(userId, userEmail, plan)
    } else {
      return NextResponse.json(
        { error: 'Invalid type or missing productId/planId' },
        { status: 400 }
      )
    }

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Error in create-checkout-session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
