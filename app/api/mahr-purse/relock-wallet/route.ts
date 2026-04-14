import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userType, unlockDate } = body

    if (!userId || !userType || !unlockDate) {
      return NextResponse.json(
        { error: 'userId, userType, and unlockDate are required' },
        { status: 400 }
      )
    }

    if (!['mahr', 'purse'].includes(userType)) {
      return NextResponse.json(
        { error: 'userType must be mahr or purse' },
        { status: 400 }
      )
    }

    console.log(`[mahr-purse] Relocking ${userType} wallet for user ${userId}`)

    // Get user details
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('gender, first_name')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify gender
    if (userType === 'mahr' && user.gender !== 'male') {
      return NextResponse.json(
        { error: 'Mahr wallets are only available for men' },
        { status: 403 }
      )
    }

    if (userType === 'purse' && user.gender !== 'female') {
      return NextResponse.json(
        { error: 'Purse wallets are only available for women' },
        { status: 403 }
      )
    }

    // Verify wallet exists and is active
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select(`${userType}_is_active, ${userType}_principle_address`)
      .eq('id', userId)
      .single() as { data: Record<string, any> | null, error: any | null }

    if (!userData || !userData[`${userType}_is_active`]) {
      return NextResponse.json(
        { error: `${userType === 'mahr' ? 'Mahr' : 'Purse'} wallet not found or not active` },
        { status: 404 }
      )
    }

    // Verify unlock date is in the future
    const unlockDateObj = new Date(unlockDate)
    const now = new Date()
    const tenYearsFromNow = new Date()
    tenYearsFromNow.setFullYear(now.getFullYear() + 10)

    if (unlockDateObj <= now) {
      return NextResponse.json(
        { error: 'Unlock date must be in the future' },
        { status: 400 }
      )
    }

    if (unlockDateObj > tenYearsFromNow) {
      return NextResponse.json(
        { error: 'Unlock date cannot be more than 10 years from today' },
        { status: 400 }
      )
    }

    console.log(`[mahr-purse] New unlock date: ${unlockDateObj.toISOString()}`)

    // Update user record with new unlock date
    const updateData: any = {
      [`${userType}_unlock_date`]: unlockDateObj.toISOString(),
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('[mahr-purse] Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to relock wallet' },
        { status: 500 }
      )
    }

    console.log(`[mahr-purse] ${userType} wallet relocked successfully`)

    return NextResponse.json({
      success: true,
      data: {
        address: userData[`${userType}_principle_address`],
        unlockDate: unlockDateObj.toISOString(),
        isActive: true,
      },
    })
  } catch (error: any) {
    console.error('[mahr-purse] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to relock wallet' },
      { status: 500 }
    )
  }
}
