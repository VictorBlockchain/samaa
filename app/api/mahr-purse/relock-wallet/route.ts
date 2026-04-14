import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createTimelockedAddress } from '@/lib/bitcoin-timelock'
import { generateUserKeypair, getUTXOs, createTransaction, broadcastTransaction, getDecryptedPrivateKey } from '@/lib/bitcoin-split'
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

    // Generate new Bitcoin keypair for the new timelocked wallet
    const keypair = generateUserKeypair(Date.now())
    console.log(`[mahr-purse] Generated new keypair for relock`)

    // Create new timelocked address with the new unlock date
    const unlockTimestamp = Math.floor(unlockDateObj.getTime() / 1000)
    const newTimelock = createTimelockedAddress(
      keypair.publicKey,
      unlockTimestamp,
      true
    )
    console.log(`[mahr-purse] Created new timelocked address: ${newTimelock.address}`)

    // Get the old wallet's encrypted private key
    const oldPrivateKeyEncrypted = userData[`${userType}_principle_address_key`]
    
    if (!oldPrivateKeyEncrypted) {
      return NextResponse.json(
        { error: 'Cannot relock: wallet private key not found' },
        { status: 500 }
      )
    }

    // Decrypt the old private key
    const oldPrivateKeyWIF = getDecryptedPrivateKey(oldPrivateKeyEncrypted)
    const oldAddress = userData[`${userType}_principle_address`]

    // Get current balance from blockchain
    const { getAddressBalance } = await import('@/lib/bitcoin-split')
    const currentBalance = await getAddressBalance(oldAddress)
    
    console.log(`[mahr-purse] Current balance: ${currentBalance} satoshis`)

    if (currentBalance === 0) {
      // No funds to transfer, just update the address and date
      console.log(`[mahr-purse] No balance to transfer, updating wallet info only`)
    } else {
      // Transfer funds from old address to new timelocked address
      const utxos = await getUTXOs(oldAddress)
      
      if (utxos.length === 0) {
        return NextResponse.json(
          { error: 'No UTXOs found for transfer' },
          { status: 500 }
        )
      }

      // Reserve fee for transaction
      const networkFee = 2000
      const transferAmount = currentBalance - networkFee

      if (transferAmount <= 0) {
        return NextResponse.json(
          { error: 'Balance too low to cover network fees' },
          { status: 400 }
        )
      }

      console.log(`[mahr-purse] Transferring ${transferAmount} satoshis to new timelocked address`)

      // Create and sign the transfer transaction
      const txHex = await createTransaction(
        oldPrivateKeyWIF,
        oldAddress,
        newTimelock.address,
        transferAmount,
        utxos,
        networkFee
      )

      // Broadcast the transaction
      const txId = await broadcastTransaction(txHex)
      console.log(`[mahr-purse] Broadcasted transfer transaction: ${txId}`)
    }

    // Encrypt new private key and redeem script
    const encryptedNewPrivateKey = encrypt(keypair.privateKeyEncrypted)
    const encryptedNewRedeemScript = encrypt(newTimelock.redeemScript.toString('hex'))

    // Update user record with new wallet info
    const updateData: any = {
      [`${userType}_principle_address`]: newTimelock.address,
      [`${userType}_principle_address_key`]: encryptedNewPrivateKey,
      [`${userType}_unlock_date`]: unlockDateObj.toISOString(),
      [`${userType}_redeem_script_encrypted`]: encryptedNewRedeemScript,
      [`${userType}_balance_satoshis`]: currentBalance > 0 ? currentBalance - 2000 : 0,
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('[mahr-purse] Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update wallet after relock' },
        { status: 500 }
      )
    }

    console.log(`[mahr-purse] ${userType} wallet relocked successfully with new address`)

    return NextResponse.json({
      success: true,
      data: {
        oldAddress: userData[`${userType}_principle_address`],
        newAddress: newTimelock.address,
        unlockDate: unlockDateObj.toISOString(),
        balanceSatoshis: currentBalance > 0 ? currentBalance - 2000 : 0,
        isActive: true,
        transactionId: currentBalance > 0 ? 'pending' : null,
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
