import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAddressBalance } from '@/lib/bitcoin-split'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, requiredSatoshis } = body

    if (!userId || !requiredSatoshis) {
      return NextResponse.json(
        { error: 'userId and requiredSatoshis are required' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-check-deposit] Checking deposit for user ${userId}`)

    // Get user's current balance
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('btc_balance_satoshis, btc_address')
      .eq('id', userId)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentBalance = userData.btc_balance_satoshis || 0
    
    // Check if balance is sufficient
    const hasEnough = currentBalance >= requiredSatoshis

    console.log(`[bitcoin-check-deposit] Balance: ${currentBalance}, Required: ${requiredSatoshis}, Has enough: ${hasEnough}`)

    return NextResponse.json({
      success: true,
      deposited: hasEnough,
      currentBalance,
      requiredSatoshis,
    })
  } catch (error: any) {
    console.error('[bitcoin-check-deposit] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check deposit' },
      { status: 500 }
    )
  }
}
