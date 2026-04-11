import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, items, totalAmount, shippingAddress, promoCode, promoDiscount } = body

    if (!orderId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, items, totalAmount' },
        { status: 400 }
      )
    }

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
