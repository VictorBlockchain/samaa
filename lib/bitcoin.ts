import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
import bs58check from 'bs58check'

// Initialize BIP32 with ECC library
const bip32 = BIP32Factory(ecc)

// Network configuration
const network = process.env.NODE_ENV === 'production' 
  ? bitcoin.networks.bitcoin 
  : bitcoin.networks.testnet

/**
 * Derive a Bitcoin address from XPUB
 * @param xpub - Extended public key
 * @param index - Derivation index (should be stored/incremented in DB)
 * @returns Bitcoin address
 */
export function deriveAddress(xpub: string, index: number): string {
  try {
    // Convert zpub to vpub for testnet if needed
    let convertedXpub = xpub
    if (network === bitcoin.networks.testnet && xpub.startsWith('zpub')) {
      // zpub (mainnet) -> vpub (testnet) conversion
      const decoded = bs58check.decode(xpub)
      // Replace version bytes: zpub (0x04b24746) -> vpub (0x045f1cf6)
      decoded[0] = 0x04
      decoded[1] = 0x5f
      decoded[2] = 0x1c
      decoded[3] = 0xf6
      convertedXpub = bs58check.encode(decoded)
      console.log('[bitcoin] Converted zpub to vpub for testnet')
    }

    const node = bip32.fromBase58(convertedXpub, network)
    
    // Derive path: m/0/index for legacy or m/84'/0'/0'/0/index for native SegWit
    // Using simple m/0/index for compatibility
    const child = node.derivePath(`0/${index}`)
    
    // Generate P2WPKH (native SegWit) address
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    })
    
    if (!address) {
      throw new Error('Failed to generate address')
    }
    
    return address
  } catch (error) {
    console.error('[bitcoin] Error deriving address:', error)
    throw error
  }
}

/**
 * Fetch current BTC/USD price from CoinGecko
 * @returns Price in USD
 */
export async function fetchBTCPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch BTC price')
    }
    
    const data = await response.json()
    return data.bitcoin.usd
  } catch (error) {
    console.error('[bitcoin] Error fetching BTC price:', error)
    throw error
  }
}

/**
 * Convert USD amount to BTC (in satoshis)
 * @param usdAmount - Amount in USD
 * @param btcPrice - Current BTC price in USD
 * @returns Amount in satoshis
 */
export function usdToSatoshis(usdAmount: number, btcPrice: number): number {
  const btcAmount = usdAmount / btcPrice
  const satoshis = Math.ceil(btcAmount * 100000000) // Convert to satoshis
  return satoshis
}

/**
 * Convert satoshis to BTC
 * @param satoshis - Amount in satoshis
 * @returns Amount in BTC
 */
export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000
}

/**
 * Format BTC amount for display
 * @param satoshis - Amount in satoshis
 * @returns Formatted BTC string
 */
export function formatBTC(satoshis: number): string {
  const btc = satoshisToBTC(satoshis)
  return btc.toFixed(8)
}

/**
 * Generate Bitcoin URI for payment
 * @param address - Bitcoin address
 * @param satoshis - Amount in satoshis
 * @param label - Payment label/description
 * @returns Bitcoin URI
 */
export function generateBitcoinURI(address: string, satoshis: number, label?: string): string {
  const btcAmount = satoshisToBTC(satoshis)
  const uri = `bitcoin:${address}?amount=${btcAmount}`
  
  if (label) {
    return `${uri}&label=${encodeURIComponent(label)}`
  }
  
  return uri
}

/**
 * Check payment status for an address
 * Note: This uses a free API (blockstream.info)
 * For production, consider running your own node or using a paid service
 * @param address - Bitcoin address to check
 * @param expectedSatoshis - Expected payment amount in satoshis
 * @returns Payment status
 */
export async function checkPayment(address: string, expectedSatoshis: number): Promise<{
  paid: boolean
  receivedSatoshis: number
  confirmations: number
  txid?: string
}> {
  try {
    // Get address transactions from Blockstream API
    const response = await fetch(
      `https://${process.env.NODE_ENV === 'production' ? 'blockstream.info' : 'blockstream.info/testnet'}/api/address/${address}/txs`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }
    
    const txs = await response.json()
    
    // Check for payments to this address
    for (const tx of txs) {
      // Get full transaction details
      const txResponse = await fetch(
        `https://${process.env.NODE_ENV === 'production' ? 'blockstream.info' : 'blockstream.info/testnet'}/api/tx/${tx.txid}`
      )
      
      if (!txResponse.ok) continue
      
      const txDetails = await txResponse.json()
      
      // Check if this transaction sends to our address
      for (const output of txDetails.vout) {
        if (output.scriptpubkey_address === address) {
          const receivedSatoshis = Math.round(output.value * 100000000)
          
          if (receivedSatoshis >= expectedSatoshis) {
            return {
              paid: true,
              receivedSatoshis,
              confirmations: txDetails.status?.block_height ? 1 : 0, // Simplified
              txid: tx.txid,
            }
          }
        }
      }
    }
    
    return {
      paid: false,
      receivedSatoshis: 0,
      confirmations: 0,
    }
  } catch (error) {
    console.error('[bitcoin] Error checking payment:', error)
    throw error
  }
}
