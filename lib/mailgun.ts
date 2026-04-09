import FormData from 'form-data'
import Mailgun from 'mailgun.js'

// Email types supported by the system
export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  template?: string
  templateData?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResponse {
  success: boolean
  id?: string
  message?: string
  error?: string
}

// Initialize Mailgun client
function getMailgunClient() {
  const mailgun = new Mailgun(FormData)
  
  const apiKey = process.env.MAILGUN_API_KEY
  if (!apiKey) {
    throw new Error('MAILGUN_API_KEY is not configured')
  }
  
  return mailgun.client({
    username: 'api',
    key: apiKey,
    // When you have an EU-domain, you must specify the endpoint:
    // url: 'https://api.eu.mailgun.net'
  })
}

function getDomain(): string {
  const domain = process.env.MAILGUN_DOMAIN
  if (!domain) {
    throw new Error('MAILGUN_DOMAIN is not configured')
  }
  return domain
}

function getFromEmail(): string {
  return process.env.MAILGUN_FROM_EMAIL || `postmaster@${getDomain()}`
}

/**
 * Send a simple email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    const mg = getMailgunClient()
    const domain = getDomain()
    const from = getFromEmail()
    
    const recipients = Array.isArray(options.to) ? options.to : [options.to]
    
    console.log('[Mailgun] Sending email:', {
      domain,
      from,
      to: recipients,
      subject: options.subject,
      hasTemplate: !!options.template,
      hasHtml: !!options.html,
      hasText: !!options.text,
    })
    
    const messageData: any = {
      from: `Samaa <${from}>`,
      to: recipients,
      subject: options.subject,
    }
    
    // Add text content
    if (options.text) {
      messageData.text = options.text
    }
    
    // Add HTML content
    if (options.html) {
      messageData.html = options.html
    }
    
    // Add template if specified
    if (options.template) {
      messageData.template = options.template
      if (options.templateData) {
        messageData['h:X-Mailgun-Variables'] = JSON.stringify(options.templateData)
      }
    }
    
    // Add attachments if specified
    if (options.attachments && options.attachments.length > 0) {
      messageData.attachment = options.attachments.map(att => ({
        filename: att.filename,
        data: att.content,
        contentType: att.contentType,
      }))
    }
    
    console.log('[Mailgun] Calling mg.messages.create...')
    const data = await mg.messages.create(domain, messageData)
    console.log('[Mailgun] Email sent successfully:', data.id)
    
    return {
      success: true,
      id: data.id,
      message: 'Email sent successfully',
    }
  } catch (error: any) {
    console.error('[Mailgun] Error sending email:', error)
    console.error('[Mailgun] Error details:', {
      message: error.message,
      status: error.status,
      details: error.details,
    })
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: 'Welcome to Samaa!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Samaa</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Samaa!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Welcome to Samaa, the Muslim marriage platform designed to help you find your righteous partner. 
              We're excited to have you join our community!
            </p>
            <p style="font-size: 16px; color: #333;">
              Here are some next steps to get started:
            </p>
            <ul style="font-size: 16px; color: #333;">
              <li>Complete your profile with authentic details</li>
              <li>Add photos to increase your profile visibility</li>
              <li>Set your match preferences</li>
              <li>Start exploring potential matches</li>
            </ul>
            <p style="font-size: 16px; color: #333;">
              May Allah guide you in your journey to find a righteous spouse.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nWelcome to Samaa, the Muslim marriage platform designed to help you find your righteous partner.\n\nTo get started:\n1. Complete your profile with authentic details\n2. Add photos to increase your profile visibility\n3. Set your match preferences\n4. Start exploring potential matches\n\nMay Allah guide you in your journey to find a righteous spouse.\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send a match notification email
 */
export async function sendMatchNotification(
  email: string,
  name: string,
  matchName: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: 'You have a new match on Samaa!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Match on Samaa</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Match!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Great news! You have a new match with <strong>${matchName}</strong> on Samaa.
            </p>
            <p style="font-size: 16px; color: #333;">
              Log in to start your conversation and get to know each other.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              View Match
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nGreat news! You have a new match with ${matchName} on Samaa.\n\nLog in to start your conversation and get to know each other.\n\nView your matches at: ${process.env.NEXT_PUBLIC_APP_URL}/messages\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send a new message notification email
 */
export async function sendMessageNotification(
  email: string,
  name: string,
  senderName: string,
  messagePreview: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `${senderName} sent you a message on Samaa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Message on Samaa</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Message</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              <strong>${senderName}</strong> sent you a message:
            </p>
            <div style="background: white; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="font-size: 14px; color: #333; margin: 0;">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Reply Now
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\n${senderName} sent you a message:\n\n"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"\n\nReply at: ${process.env.NEXT_PUBLIC_APP_URL}/messages\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: 'Reset Your Samaa Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Password</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0;">
              Reset Password
            </a>
            <p style="font-size: 14px; color: #666;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nWe received a request to reset your password.\n\nClick the link below to create a new password:\n${resetLink}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.\n\nBest regards,\nThe Samaa Team`,
  })
}

// Export a test function to verify Mailgun configuration
export async function testMailgunConnection(): Promise<EmailResponse> {
  try {
    const mg = getMailgunClient()
    const domain = getDomain()
    
    // Try to send a test message to verify credentials
    const data = await mg.messages.create(domain, {
      from: `Mailgun Test <postmaster@${domain}>`,
      to: [getFromEmail()],
      subject: 'Mailgun Configuration Test',
      text: 'This is a test email to verify your Mailgun configuration is working correctly.',
    })
    
    return {
      success: true,
      message: `Connected to Mailgun successfully. Message ID: ${data.id}`,
      id: data.id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to Mailgun',
    }
  }
}

/**
 * Send email verification after sign up
 */
export async function sendEmailVerification(
  email: string,
  name: string,
  verificationLink: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - Samaa',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verify Your Email</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Thank you for signing up for Samaa! Please verify your email address to complete your registration.
            </p>
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p style="font-size: 14px; color: #666;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nThank you for signing up for Samaa!\n\nPlease verify your email address by clicking the link below:\n${verificationLink}\n\nThis link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send login notification email
 */
export async function sendLoginNotification(
  email: string,
  name: string,
  loginInfo: {
    device?: string
    browser?: string
    location?: string
    timestamp: string
    ipAddress?: string
  }
): Promise<EmailResponse> {
  const deviceInfo = [
    loginInfo.device,
    loginInfo.browser,
    loginInfo.location,
  ].filter(Boolean).join(' • ') || 'Unknown device'

  return sendEmail({
    to: email,
    subject: 'New Login to Your Samaa Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Login Detected</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Login Detected</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              A new login was detected on your Samaa account.
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>When:</strong> ${loginInfo.timestamp}</p>
              <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Device:</strong> ${deviceInfo}</p>
              ${loginInfo.ipAddress ? `<p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>IP Address:</strong> ${loginInfo.ipAddress}</p>` : ''}
            </div>
            <p style="font-size: 14px; color: #666;">
              If this wasn't you, please secure your account immediately by changing your password.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Review Account Security
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nA new login was detected on your Samaa account.\n\nWhen: ${loginInfo.timestamp}\nDevice: ${deviceInfo}\n${loginInfo.ipAddress ? `IP Address: ${loginInfo.ipAddress}` : ''}\n\nIf this wasn't you, please secure your account immediately.\n\nReview your security settings at: ${process.env.NEXT_PUBLIC_APP_URL}/settings\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send subscription renewal notification
 */
export async function sendSubscriptionRenewalEmail(
  email: string,
  name: string,
  subscriptionInfo: {
    planName: string
    renewalDate: string
    amount: string
    currency: string
  }
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: 'Your Subscription Renews Soon - Samaa Premium',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Renewal</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Subscription Renewal</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Your Samaa ${subscriptionInfo.planName} subscription is set to renew soon.
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Plan:</strong> ${subscriptionInfo.planName}</p>
              <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Renewal Date:</strong> ${subscriptionInfo.renewalDate}</p>
              <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Amount:</strong> ${subscriptionInfo.currency} ${subscriptionInfo.amount}</p>
            </div>
            <p style="font-size: 14px; color: #666;">
              Your subscription will automatically renew. To make changes to your subscription, visit your account settings.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Manage Subscription
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nYour Samaa ${subscriptionInfo.planName} subscription is set to renew soon.\n\nPlan: ${subscriptionInfo.planName}\nRenewal Date: ${subscriptionInfo.renewalDate}\nAmount: ${subscriptionInfo.currency} ${subscriptionInfo.amount}\n\nYour subscription will automatically renew. To make changes, visit: ${process.env.NEXT_PUBLIC_APP_URL}/settings\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send promotional email (admin sent)
 */
export async function sendPromotionalEmail(
  email: string,
  name: string,
  promoInfo: {
    title: string
    message: string
    ctaText?: string
    ctaLink?: string
    couponCode?: string
    expiryDate?: string
  }
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: promoInfo.title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${promoInfo.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${promoInfo.title}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333; white-space: pre-line;">
              ${promoInfo.message}
            </p>
            ${promoInfo.couponCode ? `
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px dashed #667eea;">
              <p style="font-size: 12px; color: #666; margin: 0 0 5px 0;">Use Code:</p>
              <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 3px;">${promoInfo.couponCode}</p>
              ${promoInfo.expiryDate ? `<p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">Expires: ${promoInfo.expiryDate}</p>` : ''}
            </div>
            ` : ''}
            ${promoInfo.ctaText && promoInfo.ctaLink ? `
            <a href="${promoInfo.ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              ${promoInfo.ctaText}
            </a>
            ` : ''}
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              You're receiving this email because you're a member of Samaa. 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #667eea;">Manage email preferences</a>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\n${promoInfo.title}\n\n${promoInfo.message}\n${promoInfo.couponCode ? `\nUse Code: ${promoInfo.couponCode}\n${promoInfo.expiryDate ? `Expires: ${promoInfo.expiryDate}` : ''}` : ''}\n${promoInfo.ctaText && promoInfo.ctaLink ? `\n${promoInfo.ctaText}: ${promoInfo.ctaLink}` : ''}\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send like received notification
 */
export async function sendLikeReceivedNotification(
  email: string,
  name: string,
  likerName: string,
  likerPhoto?: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `${likerName} liked your profile on Samaa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Someone Liked Your Profile</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Someone Liked You! ❤️</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Great news! <strong>${likerName}</strong> liked your profile on Samaa.
            </p>
            <p style="font-size: 16px; color: #333;">
              If you like them back, you'll be matched and can start messaging each other!
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/explore" style="display: inline-block; background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              View Profile
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nGreat news! ${likerName} liked your profile on Samaa.\n\nIf you like them back, you'll be matched and can start messaging each other!\n\nView profiles at: ${process.env.NEXT_PUBLIC_APP_URL}/explore\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send compliment received notification
 */
export async function sendComplimentReceivedNotification(
  email: string,
  name: string,
  senderName: string,
  compliment: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `${senderName} sent you a compliment on Samaa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>You Received a Compliment</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">You Received a Compliment! ✨</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              <strong>${senderName}</strong> sent you a compliment:
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b; text-align: center;">
              <p style="font-size: 18px; color: #333; margin: 0; font-style: italic;">"${compliment}"</p>
            </div>
            <p style="font-size: 16px; color: #333;">
              Compliments are a great way to break the ice and show genuine interest!
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Reply Now
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\n${senderName} sent you a compliment:\n\n"${compliment}"\n\nReply at: ${process.env.NEXT_PUBLIC_APP_URL}/messages\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send order confirmation email (shop)
 */
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderInfo: {
    orderId: string
    items: Array<{
      name: string
      quantity: number
      price: string
    }>
    subtotal: string
    shipping?: string
    total: string
    currency: string
    shippingAddress?: string
    estimatedDelivery?: string
    shopName?: string
  }
): Promise<EmailResponse> {
  const itemsList = orderInfo.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${orderInfo.currency} ${item.price}</td>
    </tr>`
  ).join('')

  return sendEmail({
    to: email,
    subject: `Order Confirmation #${orderInfo.orderId} - Samaa Shop`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Thank you for your order! ${orderInfo.shopName ? `from <strong>${orderInfo.shopName}</strong>` : ''}.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;"><strong>Order ID:</strong> #${orderInfo.orderId}</p>
              ${orderInfo.estimatedDelivery ? `<p style="font-size: 14px; color: #666; margin: 0;"><strong>Estimated Delivery:</strong> ${orderInfo.estimatedDelivery}</p>` : ''}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px;">
              <p style="font-size: 14px; color: #333; margin: 5px 0;">Subtotal: ${orderInfo.currency} ${orderInfo.subtotal}</p>
              ${orderInfo.shipping ? `<p style="font-size: 14px; color: #333; margin: 5px 0;">Shipping: ${orderInfo.currency} ${orderInfo.shipping}</p>` : ''}
              <p style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">Total: ${orderInfo.currency} ${orderInfo.total}</p>
            </div>
            
            ${orderInfo.shippingAddress ? `
            <div style="background: white; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="font-size: 12px; color: #666; margin: 0 0 5px 0;"><strong>Shipping Address:</strong></p>
              <p style="font-size: 14px; color: #333; margin: 0;">${orderInfo.shippingAddress}</p>
            </div>
            ` : ''}
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Track Order
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nThank you for your order!\n\nOrder ID: #${orderInfo.orderId}\n${orderInfo.estimatedDelivery ? `Estimated Delivery: ${orderInfo.estimatedDelivery}` : ''}\n\nItems:\n${orderInfo.items.map(i => `- ${i.name} x${i.quantity}: ${orderInfo.currency} ${i.price}`).join('\n')}\n\nSubtotal: ${orderInfo.currency} ${orderInfo.subtotal}\n${orderInfo.shipping ? `Shipping: ${orderInfo.currency} ${orderInfo.shipping}\n` : ''}Total: ${orderInfo.currency} ${orderInfo.total}\n${orderInfo.shippingAddress ? `\nShipping Address:\n${orderInfo.shippingAddress}` : ''}\n\nTrack your order at: ${process.env.NEXT_PUBLIC_APP_URL}/orders\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send order shipped notification
 */
export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderInfo: {
    orderId: string
    trackingNumber?: string
    trackingUrl?: string
    carrier?: string
    estimatedDelivery?: string
  }
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `Your Order #${orderInfo.orderId} Has Shipped!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Shipped</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Your Order Is On The Way! 📦</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              Great news! Your order <strong>#${orderInfo.orderId}</strong> has been shipped.
            </p>
            
            ${orderInfo.trackingNumber ? `
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="font-size: 12px; color: #666; margin: 0 0 5px 0;"><strong>Tracking Number:</strong></p>
              <p style="font-size: 16px; color: #333; margin: 0; font-family: monospace;">${orderInfo.trackingNumber}</p>
              ${orderInfo.carrier ? `<p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">Carrier: ${orderInfo.carrier}</p>` : ''}
            </div>
            ` : ''}
            
            ${orderInfo.estimatedDelivery ? `
            <p style="font-size: 16px; color: #333;">
              <strong>Estimated Delivery:</strong> ${orderInfo.estimatedDelivery}
            </p>
            ` : ''}
            
            ${orderInfo.trackingUrl ? `
            <a href="${orderInfo.trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Track Package
            </a>
            ` : `
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              View Order Details
            </a>
            `}
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nGreat news! Your order #${orderInfo.orderId} has been shipped.\n${orderInfo.trackingNumber ? `\nTracking Number: ${orderInfo.trackingNumber}${orderInfo.carrier ? `\nCarrier: ${orderInfo.carrier}` : ''}` : ''}${orderInfo.estimatedDelivery ? `\n\nEstimated Delivery: ${orderInfo.estimatedDelivery}` : ''}\n\nTrack your order at: ${orderInfo.trackingUrl || `${process.env.NEXT_PUBLIC_APP_URL}/orders`}\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send new message from seller/buyer notification
 */
export async function sendShopMessageNotification(
  email: string,
  name: string,
  senderName: string,
  shopName: string,
  messagePreview: string,
  orderId?: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `New message from ${shopName} on Samaa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Message</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Message from ${shopName}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              <strong>${senderName}</strong> from <strong>${shopName}</strong> sent you a message:
            </p>
            <div style="background: white; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="font-size: 14px; color: #333; margin: 0;">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
            </div>
            ${orderId ? `<p style="font-size: 14px; color: #666;">Regarding order: #${orderId}</p>` : ''}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Reply Now
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\n${senderName} from ${shopName} sent you a message:\n\n"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"\n${orderId ? `\nRegarding order: #${orderId}` : ''}\n\nReply at: ${process.env.NEXT_PUBLIC_APP_URL}/messages\n\nBest regards,\nThe Samaa Team`,
  })
}

/**
 * Send review request email after delivery
 */
export async function sendReviewRequestEmail(
  email: string,
  name: string,
  orderInfo: {
    orderId: string
    shopName: string
    items: Array<{ name: string }>
  }
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `How was your order from ${orderInfo.shopName}? - Leave a Review`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Leave a Review</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">How Was Your Order? ⭐</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Assalamu alaikum ${name},</p>
            <p style="font-size: 16px; color: #333;">
              We hope you're enjoying your purchase from <strong>${orderInfo.shopName}</strong>!
            </p>
            <p style="font-size: 16px; color: #333;">
              Your feedback helps other Muslims make informed decisions. Would you take a moment to leave a review?
            </p>
            <div style="background: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;"><strong>Order #${orderInfo.orderId}</strong></p>
              ${orderInfo.items.map(i => `<p style="font-size: 14px; color: #333; margin: 5px 0;">• ${i.name}</p>`).join('')}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
              Leave a Review
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              JazakAllah khair,<br>
              The Samaa Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Assalamu alaikum ${name},\n\nWe hope you're enjoying your purchase from ${orderInfo.shopName}!\n\nYour feedback helps other Muslims make informed decisions. Would you take a moment to leave a review?\n\nOrder #${orderInfo.orderId}:\n${orderInfo.items.map(i => `- ${i.name}`).join('\n')}\n\nLeave a review at: ${process.env.NEXT_PUBLIC_APP_URL}/orders\n\nJazakAllah khair,\nThe Samaa Team`,
  })
}
