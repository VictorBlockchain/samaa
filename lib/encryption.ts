import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * Encrypt text using AES
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

/**
 * Decrypt text using AES
 */
export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Encrypt Bitcoin private key
 */
export function encryptPrivateKey(privateKey: string): string {
  return encrypt(privateKey)
}

/**
 * Decrypt Bitcoin private key
 */
export function decryptPrivateKey(encryptedKey: string): string {
  return decrypt(encryptedKey)
}
