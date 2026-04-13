import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * Encrypt text using AES
 * @param text - Text to encrypt
 * @param key - Optional encryption key (uses ENCRYPTION_KEY from env if not provided)
 */
export function encrypt(text: string, key?: string): string {
  const encryptionKey = key || ENCRYPTION_KEY
  return CryptoJS.AES.encrypt(text, encryptionKey).toString()
}

/**
 * Decrypt text using AES
 * @param ciphertext - Encrypted text
 * @param key - Optional encryption key (uses ENCRYPTION_KEY from env if not provided)
 */
export function decrypt(ciphertext: string, key?: string): string {
  const encryptionKey = key || ENCRYPTION_KEY
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Encrypt Bitcoin private key
 * @param privateKey - Private key to encrypt
 * @param key - Optional encryption key
 */
export function encryptPrivateKey(privateKey: string, key?: string): string {
  return encrypt(privateKey, key)
}

/**
 * Decrypt Bitcoin private key
 * @param encryptedKey - Encrypted private key
 * @param key - Optional encryption key
 */
export function decryptPrivateKey(encryptedKey: string, key?: string): string {
  return decrypt(encryptedKey, key)
}
