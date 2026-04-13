# Bitcoin Payment Splitting System - Implementation Guide

## ✅ What's Been Implemented

### 1. Core Libraries
- **`lib/encryption.ts`** - AES-256 encryption utilities
- **`lib/bitcoin-split.ts`** - Bitcoin transaction creation and signing
- **`lib/bitcoin.ts`** - Original Bitcoin utilities (address derivation, price fetching)

### 2. Database Schema
**Migration: `2026-04-15_bitcoin_payment_splitting.sql`**

#### Admin Settings Table Additions:
```sql
- admin_master_private_key_encrypted TEXT
- admin_payout_address TEXT (BC1QMV3U6WHG45ATGU9W525ZGJTQPWVS4VKM77T9C4)
- community_btc_address TEXT
- community_private_key_encrypted TEXT
- shop_split_percentage DECIMAL (default 10%)
```

#### Users Table Additions:
```sql
- btc_address TEXT - User's unique Bitcoin address
- btc_private_key_encrypted TEXT - Encrypted private key
- btc_balance_satoshis INTEGER - User's BTC balance
- btc_address_index INTEGER - HD wallet derivation index
```

#### New Tables:
1. **`bitcoin_transactions`** - Tracks all BTC transactions
2. **`bitcoin_withdrawals`** - User withdrawal requests

### 3. Payment Split Logic

**Function: `calculate_payment_splits()`**
```
For Subscription/Views/Leads:
- Community: community_split_percentage% (from admin_settings)
- Referral: 10% (if referred_by exists)
- Admin: Remaining amount

For Shop Payments:
- Community: community_split_percentage%
- Admin Fee: shop_split_percentage%
- Seller: Remaining amount
```

### 4. Environment Variables
```env
XPUB_KEY=zpub6qcVNiqCorn2hWNo2UYzbLd9nXJUEVpgDchcqRSQiD1tQEHhF4ayCSDAmGmWDks7PHJhoRsmX2EJdGNq2CWfuzi4k5auYEmC4zTdq2ZThrL
ADMIN_BTC_ADDRESS=BC1QMV3U6WHG45ATGU9W525ZGJTQPWVS4VKM77T9C4
ENCRYPTION_KEY=a3f8b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
ADMIN_MASTER_PRIVATE_KEY_ENCRYPTED=
COMMUNITY_PRIVATE_KEY_ENCRYPTED=
```

## 🔄 What Needs to Be Completed

### Step 1: Run Database Migration
```sql
-- Run in Supabase SQL Editor:
-- File: schema/migrations/2026-04-15_bitcoin_payment_splitting.sql
```

### Step 2: Generate Admin & Community Keys

You need to run a script to:
1. Generate admin master private key (encrypted)
2. Generate community private key (encrypted)
3. Store encrypted keys in admin_settings table

**Setup Script (run once):**
```typescript
// scripts/setup-bitcoin-keys.ts
import { generateUserKeypair, encrypt } from '../lib/bitcoin-split'

// Generate admin keypair
const adminKeys = generateUserKeypair(0)
console.log('Admin Address:', adminKeys.address)
console.log('Admin Encrypted Key:', adminKeys.privateKeyEncrypted)

// Generate community keypair  
const communityKeys = generateUserKeypair(1)
console.log('Community Address:', communityKeys.address)
console.log('Community Encrypted Key:', communityKeys.privateKeyEncrypted)

// UPDATE admin_settings SET:
// admin_master_private_key_encrypted = '...'
// community_btc_address = '...'
// community_private_key_encrypted = '...'
// admin_payout_address = 'BC1QMV3U6WHG45ATGU9W525ZGJTQPWVS4VKM77T9C4'
```

### Step 3: Update User Registration

When users sign up, generate a Bitcoin address for them:

```typescript
// In signup flow or profile creation
import { generateUserKeypair } from '@/lib/bitcoin-split'

const keys = generateUserKeypair(user.btc_address_index || 0)

await supabase
  .from('users')
  .update({
    btc_address: keys.address,
    btc_private_key_encrypted: keys.privateKeyEncrypted,
    btc_address_index: keys.index
  })
  .eq('id', userId)
```

### Step 4: Create Payment Processing API

**File: `app/api/bitcoin/process-payment/route.ts`**

This endpoint will:
1. Detect payment on blockchain (like current check-payment)
2. Calculate splits using `calculate_payment_splits()`
3. Credit referral bonus to referrer's btc_balance_satoshis
4. Record all transactions in bitcoin_transactions table
5. Send email notification to referrer about bonus
6. Queue admin/community payouts for batch processing

### Step 5: Create Payout Processing API

**File: `app/api/bitcoin/process-payouts/route.ts`**

Batch process pending payouts:
1. Get all pending admin payouts
2. Send to admin_payout_address
3. Get all pending community payouts  
4. Send to community_btc_address
5. Update transaction records with txids

This should run:
- Manually from admin panel, OR
- Via cron job (Supabase cron or Vercel cron)

### Step 6: Create User Withdrawal API

**File: `app/api/bitcoin/withdraw/route.ts`**

Allows users to withdraw their BTC balance:
1. Verify user has sufficient balance
2. Create withdrawal record
3. Send BTC to user's specified address
4. Deduct from btc_balance_satoshis
5. Record transaction

### Step 7: Update Wallet UI

**File: `components/wallet/bitcoin-wallet.tsx`**

Create new component showing:
- User's Bitcoin address with QR code
- Current BTC balance (satoshis + BTC + USD)
- Transaction history
- Withdraw button (opens modal)
- Deposit instructions

Add this to wallet-view.tsx as a new tab or section.

### Step 8: Create Withdrawal Modal

**File: `components/wallet/withdraw-modal.tsx`**

Modal with:
- Input for destination BTC address
- Amount to withdraw (with max button)
- Fee estimate
- Confirm button

### Step 9: Admin Panel Updates

**File: `app/admin/page.tsx`**

Add Bitcoin tab with:
- Admin BTC balance
- Community BTC balance
- Pending payouts list
- Process payouts button
- View all transactions
- View withdrawal requests

### Step 10: Email Notifications

**File: `app/api/email/bitcoin-bonus/route.ts`**

Send email when:
- User receives referral bonus
- Withdrawal is processed
- Large payment received

## 🔐 Security Considerations

### Encrypted Key Storage
- Private keys are AES-256 encrypted before storing in database
- ENCRYPTION_KEY must be kept secure (not in code repo)
- Only server-side code should decrypt keys
- Never expose private keys to client-side

### Transaction Signing
- All signing happens server-side
- Use environment variable for ENCRYPTION_KEY
- Consider using HSM or AWS KMS in production

### Rate Limiting
- Add rate limiting to withdrawal endpoint
- Implement withdrawal limits per user
- Require email confirmation for large withdrawals

## 💰 Payment Flow Example

### User Purchases Subscription ($10)

1. **Payment Created**
   - User sends 0.00015 BTC to unique address
   - Payment recorded in bitcoin_payments table

2. **Payment Detected**
   - check-payment API detects transaction
   - Amount: 15,000 satoshis

3. **Splits Calculated**
   - Community (10%): 1,500 satoshis
   - Referral (10%): 1,500 satoshis (if applicable)
   - Admin (80%): 12,000 satoshis

4. **Auto-Credit Referral**
   - Referrer's btc_balance_satoshis += 1,500
   - Transaction recorded
   - Email sent to referrer

5. **Queue Admin/Community Payouts**
   - Mark payouts as pending
   - Admin payout: 12,000 satoshis
   - Community payout: 1,500 satoshis

6. **Batch Process Payouts** (manual or cron)
   - Send admin payout to admin_payout_address
   - Send community payout to community_btc_address
   - Record txids

## 📊 Database Queries

### Check User Balance
```sql
SELECT 
  btc_address,
  btc_balance_satoshis,
  btc_balance_satoshis / 100000000.0 as btc_balance
FROM users 
WHERE id = 'user-uuid';
```

### View Pending Payouts
```sql
SELECT 
  bp.id,
  bp.payment_type,
  bp.split_admin_satoshis,
  bp.split_community_satoshis,
  bp.split_referral_satoshis,
  u.email
FROM bitcoin_payments bp
JOIN users u ON u.id = bp.user_id
WHERE bp.status = 'confirmed'
  AND (bp.admin_txid IS NULL OR bp.community_txid IS NULL);
```

### User Transaction History
```sql
SELECT 
  bt.*,
  u.email
FROM bitcoin_transactions bt
JOIN users u ON u.id = bt.user_id
WHERE bt.user_id = 'user-uuid'
ORDER BY bt.created_at DESC;
```

## 🚀 Deployment Checklist

- [ ] Run database migration
- [ ] Generate admin/community keypairs
- [ ] Store encrypted keys in admin_settings
- [ ] Set admin_payout_address
- [ ] Test on testnet first
- [ ] Implement user keypair generation on signup
- [ ] Create payment processing API
- [ ] Create payout processing API
- [ ] Create withdrawal API
- [ ] Build wallet UI components
- [ ] Add admin panel Bitcoin tab
- [ ] Set up email notifications
- [ ] Test referral bonus flow
- [ ] Test withdrawal flow
- [ ] Add rate limiting
- [ ] Deploy to production
- [ ] Monitor transactions

## 🛠️ Testing on Testnet

1. Get testnet BTC: https://testnet-faucet.mempool.co/
2. Set `NODE_ENV=development` (uses testnet automatically)
3. Use testnet wallets (BlueWallet, Electrum)
4. Verify all splits and transactions
5. Test withdrawal flow

## 📞 Support

For questions or implementation help:
- Review existing code in `lib/bitcoin-split.ts`
- Check database functions in migration file
- See payment flow examples above
- Test incrementally (one feature at a time)
