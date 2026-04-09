import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailVerification } from '@/lib/mailgun'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, age, gender } = body

    console.log('[Signup] Received signup request for:', email)

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      )
    }

    // Validate age if provided
    if (age && (isNaN(age) || age < 18 || age > 120)) {
      return NextResponse.json(
        { error: 'Age must be between 18 and 120' },
        { status: 400 }
      )
    }

    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json(
        { error: 'Gender must be male, female, or other' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    console.log('[Signup] Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        age: age || null,
        gender: gender || null,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      // Handle specific errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user record in users table
    console.log('[Signup] Creating user record in database...')
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        age: age || null,
        gender: gender || null,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up the auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Generate email verification link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email`,
      },
    })

    // Send verification email via Mailgun
    console.log('[Signup] Sending verification email...')
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email?token=${authData.user.id}&email=${encodeURIComponent(email)}`
    
    console.log('[Signup] Verification link:', verificationLink)
    
    const emailResult = await sendEmailVerification(
      email,
      firstName,
      verificationLink
    )

    console.log('[Signup] Email result:', emailResult)

    if (!emailResult.success) {
      console.error('[Signup] Email sending failed:', emailResult.error)
      // Still return success - user was created, they can request a new verification email
    } else {
      console.log('[Signup] Verification email sent successfully:', emailResult.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: authData.user.id,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
