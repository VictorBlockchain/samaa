import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, type, productId, planId, orderId, items, totalAmount, shippingAddress, promoCode, promoDiscount } = body

    // Handle wallet purchases (subscriptions, views, leads)
    if (type === 'subscription' || type === 'views' || type === 'leads') {
      return await handleWalletPurchase({ userId, userEmail, type, productId, planId })
    }

    // Handle shop orders
    if (!orderId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, items, totalAmount' },
        { status: 400 }
      )
    }

    return await handleShopOrder({ orderId, items, totalAmount, shippingAddress, promoCode, promoDiscount })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// Handle wallet purchases (subscriptions, views, leads)
async function handleWalletPurchase({ userId, userEmail, type, productId, planId }: any) {
  if (!userId || !userEmail) {
    return NextResponse.json(
      { error: 'Missing userId or userEmail' },
      { status: 400 }
    )
  }

  console.log('[checkout-session] Wallet purchase:', { type, productId, planId, userId })

  // Get admin settings for pricing
  const { data: settings } = await supabaseAdmin
    .from('admin_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (!settings) {
    return NextResponse.json(
      { error: 'Admin settings not configured' },
      { status: 500 }
    )
  }

  let lineItems: any[] = []
  let metadata: any = { userId, type }

  // Handle subscription
  if (type === 'subscription' && planId) {
    const isYearly = planId.includes('yearly')
    const price = isYearly ? settings.premium_yearly_price : settings.premium_monthly_price
    const viewsIncluded = isYearly ? settings.premium_yearly_views : settings.premium_monthly_views
    const leadsIncluded = isYearly ? settings.premium_yearly_leads : settings.premium_monthly_leads
    const interval = isYearly ? 'year' : 'month'

    lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Premium ${interval.charAt(0).toUpperCase() + interval.slice(1)} Subscription`,
          description: `${viewsIncluded} views and ${leadsIncluded} leads per ${interval}`,
        },
        unit_amount: Math.round(price * 100),
        recurring: {
          interval: interval as 'month' | 'year',
        },
      },
      quantity: 1,
    }]

    metadata = { ...metadata, planId, viewsIncluded, leadsIncluded, interval }
  }
  // Handle views purchase
  else if (type === 'views' && productId) {
    const viewsMap: any = {
      'views_25': { views: 25, price: settings.views_25_price },
      'views_50': { views: 50, price: settings.views_50_price },
      'views_100': { views: 100, price: settings.views_100_price },
      'views_250': { views: 250, price: settings.views_250_price },
      'views_500': { views: 500, price: settings.views_500_price },
      // Legacy product IDs
      'likes_25': { views: 25, price: settings.views_25_price },
      'likes_50': { views: 50, price: settings.views_50_price },
      'likes_100': { views: 100, price: settings.views_100_price },
      'likes_250': { views: 250, price: settings.views_250_price },
      'likes_500': { views: 500, price: settings.views_500_price },
    }

    const product = viewsMap[productId]
    if (!product) {
      return NextResponse.json(
        { error: `Invalid product ID: ${productId}` },
        { status: 400 }
      )
    }

    lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${product.views} Views Package`,
          description: `Purchase ${product.views} views for your profile`,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: 1,
    }]

    metadata = { ...metadata, productId, views: product.views }
  }
  // Handle leads purchase
  else if (type === 'leads' && productId) {
    const leadsMap: any = {
      'leads_25': { leads: 25, price: settings.leads_25_price },
      'leads_50': { leads: 50, price: settings.leads_50_price },
      'leads_100': { leads: 100, price: settings.leads_100_price },
      'leads_250': { leads: 250, price: settings.leads_250_price },
      'leads_500': { leads: 500, price: settings.leads_500_price },
      // Legacy product IDs
      'compliments_25': { leads: 25, price: settings.leads_25_price },
      'compliments_50': { leads: 50, price: settings.leads_50_price },
      'compliments_100': { leads: 100, price: settings.leads_100_price },
      'compliments_250': { leads: 250, price: settings.leads_250_price },
      'compliments_500': { leads: 500, price: settings.leads_500_price },
    }

    const product = leadsMap[productId]
    if (!product) {
      return NextResponse.json(
        { error: `Invalid product ID: ${productId}` },
        { status: 400 }
      )
    }

    lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${product.leads} Leads Package`,
          description: `Purchase ${product.leads} leads to start conversations`,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: 1,
    }]

    metadata = { ...metadata, productId, leads: product.leads }
  }
  else {
    return NextResponse.json(
      { error: 'Invalid purchase type or missing product/plan ID' },
      { status: 400 }
    )
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: type === 'subscription' ? 'subscription' : 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?success=true&type=${type}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?cancelled=true`,
    customer_email: userEmail,
    metadata,
  })

  return NextResponse.json({ url: session.url })
}

// Handle shop orders
async function handleShopOrder({ orderId, items, totalAmount, shippingAddress, promoCode, promoDiscount }: any) {
  try {
    console.log('[checkout-session] Processing order:', orderId)

    // Get user email from order - using admin client to bypass RLS
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) {
      console.error('[checkout-session] Error fetching order:', orderError)
      return NextResponse.json(
        { error: `Order lookup failed: ${orderError.message}` },
        { status: 400 }
      )
    }

    if (!order) {
      console.error('[checkout-session] Order not found:', orderId)
      return NextResponse.json(
        { error: `Order not found: ${orderId}` },
        { status: 400 }
      )
    }

    console.log('[checkout-session] Order found, fetching user email for user_id:', order.user_id)

    // Get user email - try users table first, then fallback to auth.users
    let userEmail: string | null = null
    
    // Try to get email from users table
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', order.user_id)
      .maybeSingle()
    
    if (userProfile?.email) {
      userEmail = userProfile.email
      console.log('[checkout-session] Found email in users table:', userEmail)
    } else {
      // Fallback: Get email from auth.users using admin API
      console.log('[checkout-session] Email not in users table, fetching from auth...')
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
      
      if (authError) {
        console.error('[checkout-session] Error fetching auth user:', authError)
      } else if (authUser?.user?.email) {
        userEmail = authUser.user.email
        console.log('[checkout-session] Found email in auth.users:', userEmail)
        
        // Optionally create/update the users table record with the email
        await supabaseAdmin
          .from('users')
          .upsert({
            id: order.user_id,
            email: userEmail,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) {
              console.error('[checkout-session] Failed to upsert user profile:', error)
            } else {
              console.log('[checkout-session] Updated users table with email')
            }
          })
      }
    }

    if (!userEmail) {
      console.error('[checkout-session] User email not found for user_id:', order.user_id)
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    console.log('[checkout-session] Creating Stripe session for email:', userEmail)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop/?shopId=${encodeURIComponent(items[0]?.shopId || '')}&payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop/?shopId=${encodeURIComponent(items[0]?.shopId || '')}&payment=cancelled`,
      customer_email: userEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'AE', 'SA'],
      },
      metadata: {
        orderId,
        userId: order.user_id,
        type: 'shop_order',
        promoCode: promoCode || '',
        promoDiscount: promoDiscount?.toString() || '0',
      },
    })

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
