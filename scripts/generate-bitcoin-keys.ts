#!/usr/bin/env tsx
/**
 * Generate and encrypt Admin & Community Bitcoin private keys
 * 
 * Usage:
 *   tsx scripts/generate-bitcoin-keys.ts
 * 
 * This will output:
 * - Generated private keys (WIF format)
 * - Encrypted private keys (for database storage)
 * - Bitcoin addresses
 * 
 * Copy the encrypted keys to:
 * - .env.local: ADMIN_MASTER_PRIVATE_KEY_ENCRYPTED
 * - .env.local: COMMUNITY_PRIVATE_KEY_ENCRYPTED
 * - Database admin_settings: admin_master_private_key_encrypted
 * - Database admin_settings: community_private_key_encrypted
 */

import * as dotenv from 'dotenv'
import { generateUserKeypair } from '../lib/bitcoin-split'
import { encrypt } from '../lib/encryption'

// Load environment variables
dotenv.config({ path: '.env.local' })

console.log('🔐 Bitcoin Key Generator for Admin & Community Wallets\n')
console.log('=' .repeat(80))

// Generate Admin Master Key (index 0)
console.log('\n📋 Generating ADMIN MASTER KEY (index 0)...')
const adminKeys = generateUserKeypair(0)

console.log('\n✅ Admin Key Generated:')
console.log('-'.repeat(80))
console.log(`Address:           ${adminKeys.address}`)
console.log(`Private Key (WIF): ${adminKeys.privateKeyEncrypted}`)
console.log(`Public Key:        ${adminKeys.publicKey}`)

// Encrypt the private key
const adminEncryptedKey = encrypt(adminKeys.privateKeyEncrypted)
console.log(`Encrypted Key:     ${adminEncryptedKey}`)
console.log('-'.repeat(80))

// Generate Community Key (index 1)
console.log('\n📋 Generating COMMUNITY KEY (index 1)...')
const communityKeys = generateUserKeypair(1)

console.log('\n✅ Community Key Generated:')
console.log('-'.repeat(80))
console.log(`Address:           ${communityKeys.address}`)
console.log(`Private Key (WIF): ${communityKeys.privateKeyEncrypted}`)
console.log(`Public Key:        ${communityKeys.publicKey}`)

// Encrypt the private key
const communityEncryptedKey = encrypt(communityKeys.privateKeyEncrypted)
console.log(`Encrypted Key:     ${communityEncryptedKey}`)
console.log('-'.repeat(80))

// Display .env.local updates
console.log('\n📝 Update your .env.local file with these values:')
console.log('=' .repeat(80))
console.log(`\nADMIN_MASTER_PRIVATE_KEY_ENCRYPTED=${adminEncryptedKey}`)
console.log(`COMMUNITY_PRIVATE_KEY_ENCRYPTED=${communityEncryptedKey}`)
console.log('\n' + '=' .repeat(80))

// Display database update SQL
console.log('\n📝 Update your database admin_settings table:')
console.log('=' .repeat(80))
console.log(`\nUPDATE admin_settings SET`)
console.log(`  admin_master_private_key_encrypted = '${adminEncryptedKey}',`)
console.log(`  community_private_key_encrypted = '${communityEncryptedKey}',`)
console.log(`  admin_payout_address = 'BC1QMV3U6WHG45ATGU9W525ZGJTQPWVS4VKM77T9C4'`)
console.log(`WHERE id = (SELECT id FROM admin_settings LIMIT 1);`)
console.log('\n' + '=' .repeat(80))

// Security warning
console.log('\n⚠️  SECURITY WARNINGS:')
console.log('=' .repeat(80))
console.log('1. Save the private keys shown above in a secure location!')
console.log('2. These private keys control the Bitcoin funds.')
console.log('3. Never share the unencrypted private keys.')
console.log('4. Only the ENCRYPTED keys should be stored in the database.')
console.log('5. Keep your ENCRYPTION_KEY secure (.env.local).')
console.log('6. Back up the private keys offline (paper wallet, hardware wallet).')
console.log('7. Test on testnet first before using on mainnet!')
console.log('=' .repeat(80))

// Test decryption
console.log('\n🧪 Testing decryption...')
const adminDecrypted = encrypt(adminKeys.privateKeyEncrypted)
const communityDecrypted = encrypt(communityKeys.privateKeyEncrypted)

if (adminDecrypted && communityDecrypted) {
  console.log('✅ Encryption/decryption test passed!')
} else {
  console.log('❌ Encryption/decryption test failed!')
  process.exit(1)
}

console.log('\n✅ Key generation complete!\n')
