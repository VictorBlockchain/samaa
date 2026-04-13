import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUserKeypair } from '@/lib/bitcoin-split'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    console.log(`[bitcoin-generate] Generating BTC address for user ${userId}`)

    // Get user's current address index
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('last_btc_address_index, btc_address')
      .eq('id', userId)
      .single()

    // If user already has an address, return it
    if (userData?.btc_address) {
      return NextResponse.json({
        success: true,
        data: {
          address: userData.btc_address,
          balance: 0,
        },
      })
    }

    // Generate new random keypair for user (not derived from XPUB)
    const addressIndex = (userData?.last_btc_address_index || 0) + 1
    const keypair = generateUserKeypair(addressIndex)

    console.log(`[bitcoin-generate] Generated address: ${keypair.address} (index: ${addressIndex})`)

    // Update user record with address and encrypted private key
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        btc_address: keypair.address,
        btc_private_key_encrypted: keypair.privateKeyEncrypted,
        last_btc_address_index: addressIndex,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[bitcoin-generate] Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate address' },
        { status: 500 }
      )
    }

    console.log(`[bitcoin-generate] Address generated successfully`)

    return NextResponse.json({
      success: true,
      data: {
        address: keypair.address,
        balance: 0,
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-generate] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate Bitcoin address' },
      { status: 500 }
    )
  }
}
