import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import { BIP32Factory } from 'bip32'

// Initialize libraries
const bip32 = BIP32Factory(ecc)
const ECPair = ECPairFactory(ecc)

const network = process.env.NODE_ENV === 'production' 
  ? bitcoin.networks.bitcoin 
  : bitcoin.networks.testnet

/**
 * Create a time-locked address using CLTV (CheckLockTimeVerify)
 * 
 * @param publicKey - Recipient's public key (hex string)
 * @param unlockTime - Unix timestamp or block height when funds can be spent
 * @param isTimestamp - If true, unlockTime is a timestamp. If false, it's a block height
 * @returns Object with address and redeemScript
 */
export function createTimelockedAddress(
  publicKey: string,
  unlockTime: number,
  isTimestamp: boolean = true
): {
  address: string
  redeemScript: Buffer
  lockTime: number
} {
  const pubkeyBuffer = Buffer.from(publicKey, 'hex')
  
  // CLTV requires the time to be encoded in the script
  // For timestamps, must be >= 500000000 (Unix timestamp)
  // For block heights, must be < 500000000
  const lockTime = isTimestamp ? Math.max(unlockTime, 500000000) : Math.min(unlockTime, 499999999)
  
  // Build the redeem script for CLTV
  // OP_IF
  //   OP_PUSH <locktime>
  //   OP_CHECKLOCKTIMEVERIFY
  //   OP_DROP
  // OP_ELSE
  //   OP_PUSH <pubkey>
  //   OP_CHECKSIG
  // OP_ENDIF
  const redeemScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(lockTime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    bitcoin.opcodes.OP_ELSE,
    pubkeyBuffer,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ENDIF,
  ])
  
  // Create P2SH address from redeem script
  const { address } = bitcoin.payments.p2sh({
    redeem: {
      output: redeemScript,
      network,
    },
    network,
  })
  
  if (!address) {
    throw new Error('Failed to create timelocked address')
  }
  
  return {
    address,
    redeemScript: Buffer.from(redeemScript),
    lockTime,
  }
}

/**
 * Create a more flexible time-locked script with refund option
 * Allows recipient to spend after time OR admin to refund immediately
 * 
 * @param recipientPubKey - Recipient's public key
 * @param refundPubKey - Admin/refund public key
 * @param unlockTime - Unix timestamp when recipient can spend
 * @returns Object with address and redeemScript
 */
export function createRefundableTimelockedAddress(
  recipientPubKey: string,
  refundPubKey: string,
  unlockTime: number
): {
  address: string
  redeemScript: Buffer
  lockTime: number
} {
  const recipientKey = Buffer.from(recipientPubKey, 'hex')
  const refundKey = Buffer.from(refundPubKey, 'hex')
  
  // Script:
  // OP_IF
  //   OP_PUSH <locktime>
  //   OP_CHECKLOCKTIMEVERIFY
  //   OP_DROP
  //   OP_DUP
  //   OP_HASH160
  //   OP_PUSH <recipient_hash>
  //   OP_EQUALVERIFY
  //   OP_CHECKSIG
  // OP_ELSE
  //   OP_DUP
  //   OP_HASH160
  //   OP_PUSH <refund_hash>
  //   OP_EQUALVERIFY
  //   OP_CHECKSIG
  // OP_ENDIF
  
  const recipientHash = bitcoin.crypto.hash160(recipientKey)
  const refundHash = bitcoin.crypto.hash160(refundKey)
  
  const redeemScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(Math.max(unlockTime, 500000000)),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    recipientHash,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ELSE,
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    refundHash,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ENDIF,
  ])
  
  const { address } = bitcoin.payments.p2sh({
    redeem: {
      output: redeemScript,
      network,
    },
    network,
  })
  
  if (!address) {
    throw new Error('Failed to create refundable timelocked address')
  }
  
  return {
    address,
    redeemScript: Buffer.from(redeemScript),
    lockTime: unlockTime,
  }
}

/**
 * Create time-locked transaction spending from CLTV address
 * 
 * @param utxos - Unspent outputs from timelocked address
 * @param toAddress - Destination address
 * @param amount - Amount to send in satoshis
 * @param redeemScript - The CLTV redeem script
 * @param privateKey - Private key to sign with
 * @param currentBlockTime - Current blockchain time/block
 * @returns Transaction hex
 */
export async function spendTimelockedUTXO(
  utxos: Array<{ txid: string; vout: number; value: number }>,
  toAddress: string,
  amount: number,
  redeemScript: Buffer,
  privateKeyWIF: string,
  currentBlockTime: number
): Promise<string> {
  const keyPair = ECPair.fromWIF(privateKeyWIF, network)
  
  const psbt = new bitcoin.Psbt({ network })
  
  // Add timelocked inputs
  for (const utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      sequence: 0, // Required for CLTV
      witnessUtxo: {
        script: bitcoin.address.toOutputScript(
          bitcoin.payments.p2sh({ redeem: { output: redeemScript, network }, network }).address!,
          network
        ),
        value: BigInt(utxo.value),
      },
      witnessScript: redeemScript,
    })
  }
  
  // Add output
  psbt.addOutput({
    address: toAddress,
    value: BigInt(amount),
  })
  
  // Add change if needed
  const totalInput = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
  const fee = 2000 // Estimated fee
  const change = totalInput - amount - fee
  
  if (change > 0) {
    const { address: changeAddress } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    })
    
    if (changeAddress) {
      psbt.addOutput({
        address: changeAddress,
        value: BigInt(change),
      })
    }
  }
  
  // Sign all inputs
  for (let i = 0; i < utxos.length; i++) {
    psbt.signInput(i, keyPair)
  }
  
  // Finalize inputs with witness script
  for (let i = 0; i < utxos.length; i++) {
    psbt.finalizeInput(i)
  }
  
  // Extract transaction
  const tx = psbt.extractTransaction()
  return tx.toHex()
}

/**
 * Calculate unlock date from timestamp
 */
export function getUnlockDate(lockTime: number): Date {
  // If lockTime >= 500000000, it's a timestamp
  if (lockTime >= 500000000) {
    return new Date(lockTime * 1000)
  }
  // Otherwise it's a block height (roughly 10 min per block)
  const currentBlock = 800000 // Approximate current block
  const blocksToWait = lockTime - currentBlock
  const minutesToWait = blocksToWait * 10
  return new Date(Date.now() + minutesToWait * 60 * 1000)
}

/**
 * Check if timelock has expired
 */
export function isTimelockExpired(lockTime: number): boolean {
  if (lockTime >= 500000000) {
    // Timestamp
    return Date.now() >= lockTime * 1000
  } else {
    // Block height - would need current block height from blockchain
    // This is a simplified check
    return false // Would need to query blockchain API
  }
}

/**
 * Create subscription-based timelocked payment
 * Generates addresses that unlock monthly for subscription periods
 */
export function createSubscriptionTimelocks(
  recipientPubKey: string,
  monthlyAmountSatoshis: number,
  months: number,
  startDate: Date
): Array<{
  address: string
  redeemScript: Buffer
  unlockDate: Date
  amount: number
  month: number
}> {
  const timelocks = []
  
  for (let month = 0; month < months; month++) {
    const unlockDate = new Date(startDate)
    unlockDate.setMonth(unlockDate.getMonth() + month)
    
    const timelock = createTimelockedAddress(
      recipientPubKey,
      Math.floor(unlockDate.getTime() / 1000),
      true
    )
    
    timelocks.push({
      ...timelock,
      unlockDate,
      amount: monthlyAmountSatoshis,
      month: month + 1,
    })
  }
  
  return timelocks
}
