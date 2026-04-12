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

    console.log('[process-purchase] Processing session:', sessionId)

    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    console.log('[process-purchase] Session status:', session.payment_status)

    // Only process if payment was successful
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const metadata = session.metadata || {}
    const { userId, type, planId, productId } = metadata

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId in metadata' },
        { status: 400 }
      )
    }

    console.log('[process-purchase] Processing purchase:', {
      userId,
      type,
      planId,
      productId,
      sessionId: session.id,
    })

    // Handle different purchase types
    if (type === 'subscription' && planId) {
      return await processSubscription(session, userId, planId, metadata)
    } else if (type === 'views' && productId) {
      return await processViews(session, userId, productId)
    } else if (type === 'leads' && productId) {
      return await processLeads(session, userId, productId)
    } else {
      return NextResponse.json(
        { error: 'Invalid purchase type or missing product/plan ID' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('[process-purchase] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    )
  }
}

// Process subscription purchase
async function processSubscription(session: any, userId: string, planId: string, metadata: any) {
  const viewsIncluded = metadata.viewsIncluded ? parseInt(metadata.viewsIncluded) : 0
  const leadsIncluded = metadata.leadsIncluded ? parseInt(metadata.leadsIncluded) : 0
  const interval = metadata.interval || 'month'

  console.log('[process-purchase] Processing subscription:', {
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
    console.log('[process-purchase] Subscription already exists, skipping')
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
    stripe_subscription_id: session.subscription?.id || null,
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
    console.error('[process-purchase] Error creating subscription:', subscriptionError)
    return NextResponse.json(
      { error: 'Failed to create subscription', details: subscriptionError },
      { status: 500 }
    )
  }

  console.log('[process-purchase] Subscription created, now adding views and leads')

  // Add views to user's account
  if (viewsIncluded > 0) {
    await addViewsToUser(userId, viewsIncluded)
  }

  // Add leads to user's account
  if (leadsIncluded > 0) {
    await addLeadsToUser(userId, leadsIncluded)
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

  console.log('[process-purchase] Successfully processed subscription for user:', userId)

  return NextResponse.json({ 
    success: true,
    type: 'subscription',
    subscription: {
      viewsIncluded,
      leadsIncluded,
      nextPaymentDate: nextPaymentDate.toISOString(),
    }
  })
}

// Process views purchase
async function processViews(session: any, userId: string, productId: string) {
  // Parse product ID to get views count (e.g., 'views_25', 'views_50')
  const viewsMatch = productId.match(/views_(\d+)/)
  const viewsCount = viewsMatch ? parseInt(viewsMatch[1]) : 0

  if (viewsCount === 0) {
    return NextResponse.json(
      { error: 'Invalid views product ID' },
      { status: 400 }
    )
  }

  console.log('[process-purchase] Processing views purchase:', {
    userId,
    productId,
    viewsCount,
  })

  // Check if already processed
  const { data: existingPayment } = await supabaseAdmin
    .from('user_payments')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existingPayment) {
    console.log('[process-purchase] Views purchase already processed, skipping')
    return NextResponse.json({ 
      success: true, 
      message: 'Views already added',
      alreadyExists: true 
    })
  }

  // Add views to user's account
  await addViewsToUser(userId, viewsCount)

  // Record payment
  const amount = session.amount_total ? session.amount_total / 100 : 0
  await supabaseAdmin.from('user_payments').insert({
    user_id: userId,
    stripe_checkout_session_id: session.id,
    amount: amount,
    currency: session.currency || 'usd',
    status: 'succeeded',
    type: 'views',
    metadata: { views: viewsCount, productId },
  })

  console.log('[process-purchase] Successfully added', viewsCount, 'views to user:', userId)

  return NextResponse.json({ 
    success: true,
    type: 'views',
    views: viewsCount,
  })
}

// Process leads purchase
async function processLeads(session: any, userId: string, productId: string) {
  // Parse product ID to get leads count (e.g., 'leads_25', 'leads_50')
  const leadsMatch = productId.match(/leads_(\d+)/)
  const leadsCount = leadsMatch ? parseInt(leadsMatch[1]) : 0

  if (leadsCount === 0) {
    return NextResponse.json(
      { error: 'Invalid leads product ID' },
      { status: 400 }
    )
  }

  console.log('[process-purchase] Processing leads purchase:', {
    userId,
    productId,
    leadsCount,
  })

  // Check if already processed
  const { data: existingPayment } = await supabaseAdmin
    .from('user_payments')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existingPayment) {
    console.log('[process-purchase] Leads purchase already processed, skipping')
    return NextResponse.json({ 
      success: true, 
      message: 'Leads already added',
      alreadyExists: true 
    })
  }

  // Add leads to user's account
  await addLeadsToUser(userId, leadsCount)

  // Record payment
  const amount = session.amount_total ? session.amount_total / 100 : 0
  await supabaseAdmin.from('user_payments').insert({
    user_id: userId,
    stripe_checkout_session_id: session.id,
    amount: amount,
    currency: session.currency || 'usd',
    status: 'succeeded',
    type: 'leads',
    metadata: { leads: leadsCount, productId },
  })

  console.log('[process-purchase] Successfully added', leadsCount, 'leads to user:', userId)

  return NextResponse.json({ 
    success: true,
    type: 'leads',
    leads: leadsCount,
  })
}

// Helper function to add views to user
async function addViewsToUser(userId: string, viewsCount: number) {
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('available_views')
    .eq('id', userId)
    .maybeSingle()

  const currentViews = userData?.available_views || 0
  const { error } = await supabaseAdmin
    .from('users')
    .update({ available_views: currentViews + viewsCount })
    .eq('id', userId)

  if (error) {
    console.error('[process-purchase] Error adding views:', error)
    throw error
  }
  
  console.log('[process-purchase] Added', viewsCount, 'views to user', userId, '(total:', currentViews + viewsCount, ')')
}

// Helper function to add leads to user
async function addLeadsToUser(userId: string, leadsCount: number) {
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('available_leads')
    .eq('id', userId)
    .maybeSingle()

  const currentLeads = userData?.available_leads || 0
  const { error } = await supabaseAdmin
    .from('users')
    .update({ available_leads: currentLeads + leadsCount })
    .eq('id', userId)

  if (error) {
    console.error('[process-purchase] Error adding leads:', error)
    throw error
  }
  
  console.log('[process-purchase] Added', leadsCount, 'leads to user', userId, '(total:', currentLeads + leadsCount, ')')
}
