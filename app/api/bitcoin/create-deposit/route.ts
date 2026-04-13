import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, amountSatoshis } = body

    if (!userId || !amountSatoshis) {
      return NextResponse.json(
        { error: 'userId and amountSatoshis are required' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-deposit] Creating deposit for user ${userId}, amount: ${amountSatoshis} satoshis`)

    // Get user's existing Bitcoin address
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('btc_address')
      .eq('id', userId)
      .single()

    if (userError || !userData?.btc_address) {
      return NextResponse.json(
        { error: 'User does not have a Bitcoin wallet address' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-deposit] Using existing deposit address: ${userData.btc_address}`)

    // Calculate BTC amount
    const amountBTC = (amountSatoshis / 100000000).toFixed(8)

    // Set expiration (30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      data: {
        address: userData.btc_address,
        amountSatoshis,
        amountBTC,
        expiresAt,
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-deposit] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create deposit' },
      { status: 500 }
    )
  }
}
