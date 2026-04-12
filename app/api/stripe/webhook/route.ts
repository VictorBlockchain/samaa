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
        const { userId, type, views, leads, planId, orderId, communitySplit } = metadata

        const amount = session.amount_total ? session.amount_total / 100 : 0
        const communityContribution = communitySplit ? (amount * parseFloat(communitySplit) / 100) : 0
        const platformFee = amount - communityContribution

        if (type === 'views' && views && userId) {
          // Add views to user's account
          const { error: viewsError } = await supabase.rpc('add_views', {
            p_user_id: userId,
            p_views: parseInt(views),
          })

          if (viewsError) {
            // Fallback: update directly on users table
            const { data: user } = await supabase
              .from('users')
              .select('available_views')
              .eq('id', userId)
              .single()

            const currentViews = user?.available_views || 0
            await supabase
              .from('users')
              .update({ available_views: currentViews + parseInt(views) })
              .eq('id', userId)
          }

          // Record payment with community contribution
          const { data: payment } = await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_checkout_session_id: session.id,
            amount: amount,
            currency: session.currency || 'usd',
            status: 'succeeded',
            type: 'views',
            community_contribution: communityContribution,
            platform_fee: platformFee,
            metadata: { views: parseInt(views) },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'views',
            })
          }
        } else if (type === 'leads' && leads && userId) {
          // Add leads to user's account
          const { error: leadsError } = await supabase.rpc('add_leads', {
            p_user_id: userId,
            p_leads: parseInt(leads),
          })

          if (leadsError) {
            // Fallback: update directly on users table
            const { data: user } = await supabase
              .from('users')
              .select('available_leads')
              .eq('id', userId)
              .single()

            const currentLeads = user?.available_leads || 0
            await supabase
              .from('users')
              .update({ available_leads: currentLeads + parseInt(leads) })
              .eq('id', userId)
          }

          // Record payment with community contribution
          const { data: payment } = await supabase.from('user_payments').insert({
            user_id: userId,
            stripe_checkout_session_id: session.id,
            amount: amount,
            currency: session.currency || 'usd',
            status: 'succeeded',
            type: 'leads',
            community_contribution: communityContribution,
            platform_fee: platformFee,
            metadata: { leads: parseInt(leads) },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'leads',
            })
          }
        } else if (type === 'subscription' && planId && userId) {
          const viewsIncluded = metadata.viewsIncluded ? parseInt(metadata.viewsIncluded) : 0
          const leadsIncluded = metadata.leadsIncluded ? parseInt(metadata.leadsIncluded) : 0
          const interval = metadata.interval || 'month'

          console.log('[webhook] Processing subscription:', {
            userId,
            planId,
            viewsIncluded,
            leadsIncluded,
            interval,
            sessionId: session.id,
            stripeSubscriptionId: session.subscription,
          })

          // Calculate dates
          const now = new Date()
          const nextPaymentDate = new Date(now)
          if (interval === 'year') {
            nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)
          } else {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
          }

          // Update or create subscription
          const { error: subscriptionError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            stripe_subscription_id: session.subscription || null,
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
            console.error('[webhook] Error creating subscription:', subscriptionError)
            throw subscriptionError
          }

          console.log('[webhook] Subscription created/updated, now adding views and leads')

          // Add views and leads to user's account
          if (viewsIncluded > 0) {
            const { data: userData } = await supabase
              .from('users')
              .select('available_views')
              .eq('id', userId)
              .maybeSingle()

            const currentViews = userData?.available_views || 0
            const { error: viewsError } = await supabase
              .from('users')
              .update({ available_views: currentViews + viewsIncluded })
              .eq('id', userId)

            if (viewsError) {
              console.error('[webhook] Error adding views:', viewsError)
            } else {
              console.log('[webhook] Added', viewsIncluded, 'views to user', userId)
            }
          }

          if (leadsIncluded > 0) {
            const { data: userData } = await supabase
              .from('users')
              .select('available_leads')
              .eq('id', userId)
              .maybeSingle()

            const currentLeads = userData?.available_leads || 0
            const { error: leadsError } = await supabase
              .from('users')
              .update({ available_leads: currentLeads + leadsIncluded })
              .eq('id', userId)

            if (leadsError) {
              console.error('[webhook] Error adding leads:', leadsError)
            } else {
              console.log('[webhook] Added', leadsIncluded, 'leads to user', userId)
            }
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
            metadata: { planId, viewsIncluded, leadsIncluded },
          }).select().single()

          // Process community contribution
          if (payment && communityContribution > 0) {
            await supabase.rpc('process_community_contribution', {
              p_payment_id: payment.id,
              p_amount: amount,
              p_source_type: 'subscription',
            })
          }

          // Check if user was referred and credit referrer
          try {
            const { data: referralData } = await supabase
              .from('referrals')
              .select('id, referrer_id, status')
              .eq('referred_id', userId)
              .eq('status', 'signed_up')
              .maybeSingle()

            if (referralData) {
              console.log('[webhook] User was referred, processing referral bonus')
              
              // Call the referral function to credit referrer
              const { error: referralError } = await supabase.rpc('process_referral_subscription', {
                p_user_id: userId,
              })

              if (referralError) {
                console.error('[webhook] Error processing referral:', referralError)
              } else {
                console.log('[webhook] Referral bonus credited to referrer:', referralData.referrer_id)
              }
            }
          } catch (referralError) {
            console.error('[webhook] Error checking referral:', referralError)
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
            .update({ 
              status: 'cancelled',
              cancel_at_period_end: false,
            })
            .eq('stripe_subscription_id', subscription.id)
          
          console.log('[webhook] Subscription cancelled for user:', userId)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        
        if (subscriptionId) {
          try {
            // Get the subscription from Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId as string) as any
            const userId = stripeSubscription.metadata?.userId

            if (userId) {
              // Calculate next payment date
              const nextPaymentDate = new Date(stripeSubscription.current_period_end * 1000)

              // Update subscription period
              await supabase
                .from('subscriptions')
                .update({
                  current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                  current_period_end: nextPaymentDate.toISOString(),
                  next_payment_date: nextPaymentDate.toISOString(),
                  status: 'active',
                })
                .eq('stripe_subscription_id', subscriptionId)

              console.log('[webhook] Subscription renewed for user:', userId, 'Next payment:', nextPaymentDate)
            }
          } catch (error) {
            console.error('[webhook] Error processing invoice.payment_succeeded:', error)
          }
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
