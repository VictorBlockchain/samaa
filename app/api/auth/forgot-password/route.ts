import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPasswordResetEmail } from '@/lib/mailgun'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      )
    }

    const user = usersData.users.find(u => u.email === email)
    
    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${user.id}&email=${encodeURIComponent(email)}`

    // Send password reset email via Mailgun
    const firstName = user.user_metadata?.first_name || 'User'
    const emailResult = await sendPasswordResetEmail(email, firstName, resetLink)

    if (!emailResult.success) {
      console.error('Email error:', emailResult.error)
      // Still return success for security
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
