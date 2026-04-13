import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBTC, getUTXOs, getAddressBalance } from '@/lib/bitcoin-split'
import { getDecryptedPrivateKey } from '@/lib/bitcoin-split'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, walletType, fromAddress, toAddress, amountSatoshis } = await request.json()

    if (!userId || !walletType || !fromAddress || !toAddress || !amountSatoshis) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate Bitcoin address format
    const isValidAddress = toAddress.length > 20 && (
      toAddress.startsWith('1') || 
      toAddress.startsWith('3') || 
      toAddress.startsWith('bc1') || 
      toAddress.startsWith('tb1')
    )

    if (!isValidAddress) {
      return NextResponse.json(
        { error: 'Invalid Bitcoin address format' },
        { status: 400 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate wallet type and get private key
    let privateKeyEncrypted: string | null = null
    let expectedAddress: string | null = null

    if (walletType === 'main') {
      privateKeyEncrypted = userData.btc_private_key_encrypted
      expectedAddress = userData.btc_address
    } else if (walletType === 'mahr') {
      privateKeyEncrypted = userData.mahr_private_key_encrypted
      expectedAddress = userData.mahr_principle_address
      
      // Check if mahr is unlocked
      if (userData.mahr_unlock_date) {
        const unlockDate = new Date(userData.mahr_unlock_date)
        const now = new Date()
        if (unlockDate > now) {
          return NextResponse.json(
            { error: 'Mahr wallet is still timelocked' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Mahr wallet not configured' },
          { status: 400 }
        )
      }
    } else if (walletType === 'purse') {
      privateKeyEncrypted = userData.purse_private_key_encrypted
      expectedAddress = userData.purse_principle_address
      
      // Check if purse is unlocked
      if (userData.purse_unlock_date) {
        const unlockDate = new Date(userData.purse_unlock_date)
        const now = new Date()
        if (unlockDate > now) {
          return NextResponse.json(
            { error: 'Purse wallet is still timelocked' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Purse wallet not configured' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid wallet type' },
        { status: 400 }
      )
    }

    if (!privateKeyEncrypted || !expectedAddress) {
      return NextResponse.json(
        { error: 'Wallet not configured' },
        { status: 400 }
      )
    }

    // Verify address matches
    if (fromAddress !== expectedAddress) {
      return NextResponse.json(
        { error: 'Address mismatch' },
        { status: 400 }
      )
    }

    // Decrypt private key
    const privateKeyWIF = getDecryptedPrivateKey(privateKeyEncrypted)

    // Get actual balance from blockchain
    const actualBalance = await getAddressBalance(fromAddress)

    // Check if amount is valid (leave room for network fee)
    const networkFee = 2000 // satoshis
    if (amountSatoshis + networkFee > actualBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance (including network fee)' },
        { status: 400 }
      )
    }

    // Send BTC
    const txId = await sendBTC(
      privateKeyWIF,
      fromAddress,
      toAddress,
      amountSatoshis
    )

    // Update database balance
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (walletType === 'main') {
      updateData.btc_balance_satoshis = Math.max(0, (userData.btc_balance_satoshis || 0) - amountSatoshis - networkFee)
    } else if (walletType === 'mahr') {
      updateData.mahr_balance_satoshis = Math.max(0, (userData.mahr_balance_satoshis || 0) - amountSatoshis - networkFee)
    } else if (walletType === 'purse') {
      updateData.purse_balance_satoshis = Math.max(0, (userData.purse_balance_satoshis || 0) - amountSatoshis - networkFee)
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('[bitcoin-withdraw] Error updating balance:', updateError)
    }

    // Log withdrawal in user_payments
    await supabaseAdmin
      .from('user_payments')
      .insert({
        user_id: userId,
        amount: 0,
        currency: 'BTC',
        status: 'succeeded',
        type: 'withdrawal',
        metadata: {
          walletType,
          fromAddress,
          toAddress,
          amountSatoshis,
          networkFee,
          txId,
        },
      })

    return NextResponse.json({
      success: true,
      data: {
        txId,
        amountSatoshis,
        networkFee,
        newBalance: updateData[walletType === 'main' ? 'btc_balance_satoshis' : walletType === 'mahr' ? 'mahr_balance_satoshis' : 'purse_balance_satoshis'],
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-withdraw] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}
