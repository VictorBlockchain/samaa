import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    console.log('[process-subscription] Processing session:', sessionId)

    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    console.log('[process-subscription] Session status:', session.payment_status)

    // Only process if payment was successful
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const metadata = session.metadata || {}
    const { userId, type, planId } = metadata

    if (type !== 'subscription' || !planId || !userId) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    const viewsIncluded = metadata.viewsIncluded ? parseInt(metadata.viewsIncluded) : 0
    const leadsIncluded = metadata.leadsIncluded ? parseInt(metadata.leadsIncluded) : 0
    const interval = metadata.interval || 'month'

    console.log('[process-subscription] Processing subscription:', {
      userId,
      planId,
      viewsIncluded,
      leadsIncluded,
      interval,
    })

    // Calculate dates
    const now = new Date()
    const nextPaymentDate = new Date(now)
    if (interval === 'year') {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)
    } else {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
    }

    // Check if subscription already exists (prevent double processing)
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('status', 'active')
      .maybeSingle()

    if (existingSub) {
      console.log('[process-subscription] Subscription already exists, skipping')
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription already processed',
        alreadyExists: true 
      })
    }

    // Create or update subscription
    const { error: subscriptionError } = await supabaseAdmin.from('subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      stripe_subscription_id: (session.subscription as any)?.id || null,
      stripe_customer_id: session.customer || null,
      views_included: viewsIncluded,
      leads_included: leadsIncluded,
      views_used: 0,
      leads_used: 0,
      current_period_start: now.toISOString(),
      current_period_end: nextPaymentDate.toISOString(),
      next_payment_date: nextPaymentDate.toISOString(),
      cancel_at_period_end: false,
    }, {
      onConflict: 'user_id,plan_id'
    })

    if (subscriptionError) {
      console.error('[process-subscription] Error creating subscription:', subscriptionError)
      return NextResponse.json(
        { error: 'Failed to create subscription', details: subscriptionError },
        { status: 500 }
      )
    }

    console.log('[process-subscription] Subscription created, now adding views and leads')

    // Add views to user's account
    if (viewsIncluded > 0) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('available_views')
        .eq('id', userId)
        .maybeSingle()

      const currentViews = userData?.available_views || 0
      const { error: viewsError } = await supabaseAdmin
        .from('users')
        .update({ available_views: currentViews + viewsIncluded })
        .eq('id', userId)

      if (viewsError) {
        console.error('[process-subscription] Error adding views:', viewsError)
      } else {
        console.log('[process-subscription] Added', viewsIncluded, 'views to user', userId)
      }
    }

    // Add leads to user's account
    if (leadsIncluded > 0) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('available_leads')
        .eq('id', userId)
        .maybeSingle()

      const currentLeads = userData?.available_leads || 0
      const { error: leadsError } = await supabaseAdmin
        .from('users')
        .update({ available_leads: currentLeads + leadsIncluded })
        .eq('id', userId)

      if (leadsError) {
        console.error('[process-subscription] Error adding leads:', leadsError)
      } else {
        console.log('[process-subscription] Added', leadsIncluded, 'leads to user', userId)
      }
    }

    // Record payment
    const amount = session.amount_total ? session.amount_total / 100 : 0
    await supabaseAdmin.from('user_payments').insert({
      user_id: userId,
      stripe_checkout_session_id: session.id,
      amount: amount,
      currency: session.currency || 'usd',
      status: 'succeeded',
      type: 'subscription',
      metadata: { planId, viewsIncluded, leadsIncluded, interval },
    })

    console.log('[process-subscription] Successfully processed subscription for user:', userId)

    return NextResponse.json({ 
      success: true,
      subscription: {
        viewsIncluded,
        leadsIncluded,
        nextPaymentDate: nextPaymentDate.toISOString(),
      }
    })
  } catch (error: any) {
    console.error('[process-subscription] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription' },
      { status: 500 }
    )
  }
}
