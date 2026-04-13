import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createTimelockedAddress } from '@/lib/bitcoin-timelock'
import { generateUserKeypair } from '@/lib/bitcoin-split'
import { encrypt } from '@/lib/encryption'

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

    console.log(`[mahr-purse] Creating ${userType} wallet for user ${userId}`)

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

    // Verify unlock date is in the future
    const unlockDateObj = new Date(unlockDate)
    if (unlockDateObj <= new Date()) {
      return NextResponse.json(
        { error: 'Unlock date must be in the future' },
        { status: 400 }
      )
    }

    // Generate Bitcoin keypair
    const keypair = generateUserKeypair(Date.now()) // Use timestamp as unique index

    // Create timelocked address
    const unlockTimestamp = Math.floor(unlockDateObj.getTime() / 1000)
    const timelock = createTimelockedAddress(
      keypair.publicKey,
      unlockTimestamp,
      true
    )

    console.log(`[mahr-purse] Generated ${userType} address: ${timelock.address}`)
    console.log(`[mahr-purse] Unlock date: ${unlockDateObj.toISOString()}`)

    // Encrypt private key and redeem script
    const encryptedPrivateKey = encrypt(keypair.privateKeyEncrypted)
    const encryptedRedeemScript = encrypt(timelock.redeemScript.toString('hex'))

    // Update user record
    const updateData: any = {
      [`${userType}_principle_address`]: timelock.address,
      [`${userType}_principle_address_key`]: encryptedPrivateKey,
      [`${userType}_unlock_date`]: unlockDateObj.toISOString(),
      [`${userType}_is_active`]: true,
      [`${userType}_balance_satoshis`]: 0,
      [`${userType}_redeem_script_encrypted`]: encryptedRedeemScript,
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('[mahr-purse] Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to create wallet' },
        { status: 500 }
      )
    }

    console.log(`[mahr-purse] ${userType} wallet created successfully`)

    return NextResponse.json({
      success: true,
      data: {
        address: timelock.address,
        balanceSatoshis: 0,
        unlockDate: unlockDateObj.toISOString(),
        isActive: true,
      },
    })
  } catch (error: any) {
    console.error('[mahr-purse] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet' },
      { status: 500 }
    )
  }
}
