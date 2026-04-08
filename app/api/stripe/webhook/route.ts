import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const metadata = session.metadata || {}
        const { userId, type, likes, compliments, planId, orderId, communitySplit } = metadata

        const amount = session.amount_total ? session.amount_total / 100 : 0
        const communityContribution = communitySplit ? (amount * parseFloat(communitySplit) / 100) : 0
        const platformFee = amount - communityContribution

        if (type === 'likes' && likes && userId) {
          // Add likes to user's account
          const { error: likesError } = await supabase.rpc('add_likes', {
            p_user_id: userId,
            p_likes: parseInt(likes),
          })

          if (likesError) {
            // Fallback: update directly on users table
            const { data: user } = await supabase
              .from('users')
              .select('available_likes')
              .eq('id', userId)
              .single()

            const currentLikes = user?.available_likes || 0
            await supabase
              .from('users')
              .update({ available_likes: currentLikes + parseInt(likes) })
              .eq('id', userId)
          }

          // Record payment with community contribution
          const { data: payment } = await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_checkout_session_id: session.id,
            amount: amount,
            currency: session.currency || 'usd',
            status: 'succeeded',
            type: 'likes',
            community_contribution: communityContribution,
            platform_fee: platformFee,
            metadata: { likes: parseInt(likes) },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'likes',
            })
          }
        } else if (type === 'compliments' && compliments && userId) {
          // Add compliments to user's account
          const { error: complimentsError } = await supabase.rpc('add_compliments', {
            p_user_id: userId,
            p_compliments: parseInt(compliments),
          })

          if (complimentsError) {
            // Fallback: update directly on users table
            const { data: user } = await supabase
              .from('users')
              .select('available_compliments')
              .eq('id', userId)
              .single()

            const currentCompliments = user?.available_compliments || 0
            await supabase
              .from('users')
              .update({ available_compliments: currentCompliments + parseInt(compliments) })
              .eq('id', userId)
          }

          // Record payment with community contribution
          const { data: payment } = await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_checkout_session_id: session.id,
            amount: amount,
            currency: session.currency || 'usd',
            status: 'succeeded',
            type: 'compliments',
            community_contribution: communityContribution,
            platform_fee: platformFee,
            metadata: { compliments: parseInt(compliments) },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'compliments',
            })
          }
        } else if (type === 'subscription' && planId && userId) {
          const likesIncluded = metadata.likesIncluded ? parseInt(metadata.likesIncluded) : 0
          const complimentsIncluded = metadata.complimentsIncluded ? parseInt(metadata.complimentsIncluded) : 0

          // Update user subscription status
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            stripe_subscription_id: session.subscription,
            likes_included: likesIncluded,
            compliments_included: complimentsIncluded,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + (planId.includes('yearly') ? 365 : 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
          })

          // Add likes and compliments from subscription
          if (likesIncluded > 0) {
            await supabase.rpc('add_likes', {
              p_user_id: userId,
              p_likes: likesIncluded,
            })
          }
          if (complimentsIncluded > 0) {
            await supabase.rpc('add_compliments', {
              p_user_id: userId,
              p_compliments: complimentsIncluded,
            })
          }

          // Record payment with community contribution
          const { data: payment } = await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_checkout_session_id: session.id,
            amount: amount,
            currency: session.currency || 'usd',
            status: 'succeeded',
            type: 'subscription',
            community_contribution: communityContribution,
            platform_fee: platformFee,
            metadata: { planId, likesIncluded, complimentsIncluded },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'subscription',
            })
          }
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const metadata = paymentIntent.metadata || {}
        const { orderId, userId } = metadata

        const amount = paymentIntent.amount / 100
        const communitySplit = parseFloat(process.env.COMMUNITY_SPLIT || '10')
        const communityContribution = amount * (communitySplit / 100)
        const platformFee = amount - communityContribution

        if (orderId && userId) {
          // Update order status
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_tx_hash: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          // Record payment with community contribution
          const { data: payment } = await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntent.id,
            amount: amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            type: 'product',
            community_contribution: communityContribution,
            platform_fee: platformFee,
            metadata: { orderId },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'product',
            })
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const metadata = paymentIntent.metadata || {}
        const { orderId, userId } = metadata

        if (userId) {
          await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'failed',
            type: 'product',
            metadata: { orderId },
          })
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', userId)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
