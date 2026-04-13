import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      )
    }

    if (!['mahr', 'purse'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be mahr or purse' },
        { status: 400 }
      )
    }

    // Get user wallet data
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        ${type}_principle_address,
        ${type}_balance_satoshis,
        ${type}_unlock_date,
        ${type}_is_active
      `)
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = user as any
    
    const walletData = {
      address: userData[`${type}_principle_address`],
      balanceSatoshis: userData[`${type}_balance_satoshis`] || 0,
      unlockDate: userData[`${type}_unlock_date`],
      isActive: userData[`${type}_is_active`] || false,
    }

    // If no wallet exists, return null
    if (!walletData.address) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: walletData,
    })
  } catch (error: any) {
    console.error('[mahr-purse] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}
