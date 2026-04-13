import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import { BIP32Factory, BIP32Interface } from 'bip32'
import { ECPairFactory } from 'ecpair'
import { encrypt, decrypt } from './encryption'

// Initialize libraries
const bip32 = BIP32Factory(ecc)
const ECPair = ECPairFactory(ecc)

// Network configuration
const network = process.env.NODE_ENV === 'production' 
  ? bitcoin.networks.bitcoin 
  : bitcoin.networks.testnet

/**
 * Generate Bitcoin keypair for a user
 * @param index - Derivation index
 * @returns Object with address, privateKey (encrypted), publicKey
 */
export function generateUserKeypair(index: number): {
  address: string
  privateKeyEncrypted: string
  publicKey: string
  index: number
} {
  try {
    // Generate random keypair
    const keyPair = bitcoin.ECPair.makeRandom({ network })
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    })
    
    if (!address) {
      throw new Error('Failed to generate address')
    }
    
    // Get private key in WIF format and encrypt it
    const privateKeyWIF = keyPair.toWIF()
    const privateKeyEncrypted = encrypt(privateKeyWIF)
    
    return {
      address,
      privateKeyEncrypted,
      publicKey: keyPair.publicKey.toString('hex'),
      index,
    }
  } catch (error) {
    console.error('[bitcoin-split] Error generating keypair:', error)
    throw error
  }
}

/**
 * Derive child key from master key
 * @param masterKey - Master private key (decrypted)
 * @param path - Derivation path (e.g., "m/0/0")
 * @returns Child key
 */
export function deriveChildKey(masterKey: string, path: string): BIP32Interface {
  const masterNode = bip32.fromBase58(masterKey, network)
  return masterNode.derivePath(path)
}

/**
 * Derive address from XPUB
 * @param xpub - Extended public key
 * @param index - Derivation index
 * @returns Bitcoin address
 */
export function deriveAddressFromXPUB(xpub: string, index: number): string {
  try {
    const node = bip32.fromBase58(xpub, network)
    const child = node.derivePath(`0/${index}`)
    
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    })
    
    if (!address) {
      throw new Error('Failed to generate address')
    }
    
    return address
  } catch (error) {
    console.error('[bitcoin-split] Error deriving address from XPUB:', error)
    throw error
  }
}

/**
 * Get decrypted private key
 * @param encryptedKey - Encrypted private key
 * @returns Decrypted private key in WIF format
 */
export function getDecryptedPrivateKey(encryptedKey: string): string {
  return decrypt(encryptedKey)
}

/**
 * Create and sign a Bitcoin transaction
 * @param privateKeyWIF - Private key in WIF format
 * @param fromAddress - Source address
 * @param toAddress - Destination address
 * @param amountSatoshis - Amount to send in satoshis
 * @param utxos - Unspent transaction outputs
 * @param feeSatoshis - Transaction fee in satoshis
 * @returns Transaction hex
 */
export async function createTransaction(
  privateKeyWIF: string,
  fromAddress: string,
  toAddress: string,
  amountSatoshis: number,
  utxos: Array<{ txid: string; vout: number; value: number }>,
  feeSatoshis: number
): Promise<string> {
  const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, network)
  
  const psbt = new bitcoin.Psbt({ network })
  
  // Add inputs
  let totalInput = 0
  for (const utxo of utxos) {
    // For P2WPKH, we need the previous transaction's output script
    // This is simplified - in production you'd fetch the full previous tx
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: bitcoin.address.toOutputScript(fromAddress, network),
        value: BigInt(utxo.value),
      },
    })
    totalInput += utxo.value
  }
  
  // Add output
  psbt.addOutput({
    address: toAddress,
    value: BigInt(amountSatoshis),
  })
  
  // Add change output if there's leftover
  const change = totalInput - amountSatoshis - feeSatoshis
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
  
  // Finalize
  psbt.finalizeAllInputs()
  
  // Extract transaction
  const tx = psbt.extractTransaction()
  return tx.toHex()
}

/**
 * Broadcast transaction to network
 * @param txHex - Transaction hex
 * @returns Transaction ID
 */
export async function broadcastTransaction(txHex: string): Promise<string> {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://blockstream.info/api'
    : 'https://blockstream.info/testnet/api'
  
  const response = await fetch(`${baseUrl}/tx`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: txHex,
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to broadcast: ${error}`)
  }
  
  return await response.text()
}

/**
 * Get UTXOs for an address
 * @param address - Bitcoin address
 * @returns Array of UTXOs
 */
export async function getUTXOs(address: string): Promise<Array<{ txid: string; vout: number; value: number }>> {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://blockstream.info/api'
    : 'https://blockstream.info/testnet/api'
  
  const response = await fetch(`${baseUrl}/address/${address}/utxo`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch UTXOs')
  }
  
  const utxos = await response.json()
  return utxos.map((utxo: any) => ({
    txid: utxo.txid,
    vout: utxo.vout,
    value: utxo.value,
  }))
}

/**
 * Get address balance
 * @param address - Bitcoin address
 * @returns Balance in satoshis
 */
export async function getAddressBalance(address: string): Promise<number> {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://blockstream.info/api'
    : 'https://blockstream.info/testnet/api'
  
  const response = await fetch(`${baseUrl}/address/${address}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch balance')
  }
  
  const data = await response.json()
  return (data.chain_stats.funded_txo_sum || 0) - (data.chain_stats.spent_txo_sum || 0)
}

/**
 * Send BTC from one address to another
 * @param privateKeyWIF - Sender's private key
 * @param fromAddress - Sender's address
 * @param toAddress - Recipient's address
 * @param amountSatoshis - Amount to send
 * @returns Transaction ID
 */
export async function sendBTC(
  privateKeyWIF: string,
  fromAddress: string,
  toAddress: string,
  amountSatoshis: number
): Promise<string> {
  // Get UTXOs
  const utxos = await getUTXOs(fromAddress)
  
  if (utxos.length === 0) {
    throw new Error('No UTXOs available')
  }
  
  // Calculate fee (simplified - ~2000 satoshis for typical tx)
  const feeSatoshis = 2000
  
  // Create and sign transaction
  const txHex = await createTransaction(
    privateKeyWIF,
    fromAddress,
    toAddress,
    amountSatoshis,
    utxos,
    feeSatoshis
  )
  
  // Broadcast
  return await broadcastTransaction(txHex)
}
