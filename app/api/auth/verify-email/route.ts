import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateUserKeypair } from '@/lib/bitcoin-split'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Get the user by ID from the token
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(token)

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }

    // Verify the email matches
    if (userData.user.email !== email) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (userData.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true,
      })
    }

    // Confirm the user's email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      token,
      { email_confirm: true }
    )

    if (confirmError) {
      console.error('Confirmation error:', confirmError)
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Update the users table to mark as verified, credit leads/views, and generate Bitcoin wallet
    const keypair = generateUserKeypair(1) // Start with index 1
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        is_verified: true,
        available_leads: 3, // Credit 3 leads after email verification
        available_views: 10, // Credit 10 views after email verification
        btc_address: keypair.address,
        btc_private_key_encrypted: keypair.privateKeyEncrypted,
        last_btc_address_index: 1,
        btc_balance_satoshis: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', token)

    if (updateError) {
      console.error('Update error:', updateError)
      // Still return success since auth is verified
    }

    console.log(`[verify-email] Generated Bitcoin wallet for user ${token}: ${keypair.address}`)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Resend verification email
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user by email
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      )
    }

    const user = usersData.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true,
      })
    }

    // Generate new verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email?token=${user.id}&email=${encodeURIComponent(email)}`

    // Import the email function dynamically to avoid circular dependencies
    const { sendEmailVerification } = await import('@/lib/mailgun')
    
    const firstName = user.user_metadata?.first_name || 'User'
    const emailResult = await sendEmailVerification(email, firstName, verificationLink)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
