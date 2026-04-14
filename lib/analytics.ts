/**
 * Google Analytics Event Tracking
 * 
 * Usage:
 *   import { trackEvent } from '@/lib/analytics'
 *   
 *   trackEvent('button_click', { button_name: 'signup' })
 *   trackEvent('purchase', { value: 19.99, currency: 'USD' })
 */

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params)
  }
}

/**
 * Track page views manually (useful for SPAs)
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-4R5SJYK1E1', {
      page_path: url,
    })
  }
}

/**
 * Track user authentication events
 */
export function trackAuthEvent(event: 'login' | 'signup' | 'logout', userId?: string) {
  trackEvent(event, {
    user_id: userId,
    method: 'email',
  })
}

/**
 * Track subscription events
 */
export function trackSubscriptionEvent(
  event: 'subscribe' | 'cancel' | 'renew',
  planId?: string,
  amount?: number
) {
  trackEvent(`subscription_${event}`, {
    plan_id: planId,
    value: amount,
    currency: 'USD',
  })
}

/**
 * Track Bitcoin payment events
 */
export function trackBitcoinPayment(
  event: 'payment_initiated' | 'payment_completed' | 'payment_failed',
  amount?: number,
  paymentType?: string
) {
  trackEvent(`bitcoin_${event}`, {
    value: amount,
    currency: 'USD',
    payment_type: paymentType,
  })
}
