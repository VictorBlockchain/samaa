import { NextRequest, NextResponse } from 'next/server'
import {
  sendEmail,
  sendWelcomeEmail,
  sendMatchNotification,
  sendMessageNotification,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendLoginNotification,
  sendSubscriptionRenewalEmail,
  sendPromotionalEmail,
  sendLikeReceivedNotification,
  sendLeadReceivedNotification,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendShopMessageNotification,
  sendReviewRequestEmail,
  testMailgunConnection,
  EmailOptions,
} from '@/lib/mailgun'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result

    switch (type) {
      case 'test':
        // Test Mailgun connection
        result = await testMailgunConnection()
        break

      case 'welcome':
        // Send welcome email to new user
        if (!data.email || !data.name) {
          return NextResponse.json(
            { error: 'Email and name are required for welcome email' },
            { status: 400 }
          )
        }
        result = await sendWelcomeEmail(data.email, data.name)
        break

      case 'match':
        // Send match notification
        if (!data.email || !data.name || !data.matchName) {
          return NextResponse.json(
            { error: 'Email, name, and matchName are required for match notification' },
            { status: 400 }
          )
        }
        result = await sendMatchNotification(data.email, data.name, data.matchName)
        break

      case 'message':
        // Send message notification
        if (!data.email || !data.name || !data.senderName || !data.messagePreview) {
          return NextResponse.json(
            { error: 'Email, name, senderName, and messagePreview are required for message notification' },
            { status: 400 }
          )
        }
        result = await sendMessageNotification(
          data.email,
          data.name,
          data.senderName,
          data.messagePreview
        )
        break

      case 'password-reset':
        // Send password reset email
        if (!data.email || !data.name || !data.resetLink) {
          return NextResponse.json(
            { error: 'Email, name, and resetLink are required for password reset' },
            { status: 400 }
          )
        }
        result = await sendPasswordResetEmail(data.email, data.name, data.resetLink)
        break

      case 'email-verification':
        // Send email verification
        if (!data.email || !data.name || !data.verificationLink) {
          return NextResponse.json(
            { error: 'Email, name, and verificationLink are required for email verification' },
            { status: 400 }
          )
        }
        result = await sendEmailVerification(data.email, data.name, data.verificationLink)
        break

      case 'login-notification':
        // Send login notification
        if (!data.email || !data.name || !data.loginInfo) {
          return NextResponse.json(
            { error: 'Email, name, and loginInfo are required for login notification' },
            { status: 400 }
          )
        }
        result = await sendLoginNotification(data.email, data.name, data.loginInfo)
        break

      case 'subscription-renewal':
        // Send subscription renewal notification
        if (!data.email || !data.name || !data.subscriptionInfo) {
          return NextResponse.json(
            { error: 'Email, name, and subscriptionInfo are required for subscription renewal' },
            { status: 400 }
          )
        }
        result = await sendSubscriptionRenewalEmail(data.email, data.name, data.subscriptionInfo)
        break

      case 'promotional':
        // Send promotional email
        if (!data.email || !data.name || !data.promoInfo) {
          return NextResponse.json(
            { error: 'Email, name, and promoInfo are required for promotional email' },
            { status: 400 }
          )
        }
        result = await sendPromotionalEmail(data.email, data.name, data.promoInfo)
        break

      case 'like-received':
        // Send like received notification
        if (!data.email || !data.name || !data.likerName) {
          return NextResponse.json(
            { error: 'Email, name, and likerName are required for like notification' },
            { status: 400 }
          )
        }
        result = await sendLikeReceivedNotification(data.email, data.name, data.likerName, data.likerPhoto)
        break

      case 'lead-received':
        // Send lead received notification
        if (!data.email || !data.name || !data.senderName || !data.lead) {
          return NextResponse.json(
            { error: 'Email, name, senderName, and compliment are required for lead notification' },
            { status: 400 }
          )
        }
        result = await sendLeadReceivedNotification(data.email, data.name, data.senderName, data.lead)
        break

      case 'order-confirmation':
        // Send order confirmation email
        if (!data.email || !data.name || !data.orderInfo) {
          return NextResponse.json(
            { error: 'Email, name, and orderInfo are required for order confirmation' },
            { status: 400 }
          )
        }
        result = await sendOrderConfirmationEmail(data.email, data.name, data.orderInfo)
        break

      case 'order-shipped':
        // Send order shipped notification
        if (!data.email || !data.name || !data.orderInfo) {
          return NextResponse.json(
            { error: 'Email, name, and orderInfo are required for order shipped notification' },
            { status: 400 }
          )
        }
        result = await sendOrderShippedEmail(data.email, data.name, data.orderInfo)
        break

      case 'shop-message':
        // Send shop message notification
        if (!data.email || !data.name || !data.senderName || !data.shopName || !data.messagePreview) {
          return NextResponse.json(
            { error: 'Email, name, senderName, shopName, and messagePreview are required for shop message' },
            { status: 400 }
          )
        }
        result = await sendShopMessageNotification(
          data.email,
          data.name,
          data.senderName,
          data.shopName,
          data.messagePreview,
          data.orderId
        )
        break

      case 'review-request':
        // Send review request email
        if (!data.email || !data.name || !data.orderInfo) {
          return NextResponse.json(
            { error: 'Email, name, and orderInfo are required for review request' },
            { status: 400 }
          )
        }
        result = await sendReviewRequestEmail(data.email, data.name, data.orderInfo)
        break

      case 'custom':
        // Send custom email
        if (!data.to || !data.subject) {
          return NextResponse.json(
            { error: 'To and subject are required for custom email' },
            { status: 400 }
          )
        }
        const emailOptions: EmailOptions = {
          to: data.to,
          subject: data.subject,
          text: data.text,
          html: data.html,
          template: data.template,
          templateData: data.templateData,
          attachments: data.attachments,
        }
        result = await sendEmail(emailOptions)
        break

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Test endpoint to verify Mailgun configuration
  try {
    const result = await testMailgunConnection()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to test Mailgun connection' },
      { status: 500 }
    )
  }
}
