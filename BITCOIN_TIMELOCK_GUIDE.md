# Bitcoin Timelock Implementation Guide

## ✅ What's Been Added

### 1. **Timelock Library** (`lib/bitcoin-timelock.ts`)

Functions available:
- `createTimelockedAddress()` - Create CLTV time-locked address
- `createRefundableTimelockedAddress()` - Time-lock with refund option
- `spendTimelockedUTXO()` - Spend from timelocked address
- `createSubscriptionTimelocks()` - Generate monthly timelocks for subscriptions
- `getUnlockDate()` - Calculate when funds unlock
- `isTimelockExpired()` - Check if timelock has expired

### 2. **Database Migration** (`2026-04-15_bitcoin_timelock_support.sql`)

New table: `timelocked_addresses`
- Stores timelocked Bitcoin addresses
- Tracks unlock dates and amounts
- Encrypted redeem scripts
- Funding/spending status

New functions:
- `can_unlock_timelock()` - Check if timelock expired
- `get_unlockable_timelocks()` - Get user's unlockable timelocks
- `unlock_timelock()` - Mark timelock as unlocked
- `create_subscription_timelocks()` - Generate monthly timelocks

## 🔐 How Timelocks Work

### CLTV (CheckLockTimeVerify)

CLTV is a Bitcoin opcode that prevents spending from an address until a specific time.

**Example Script:**
```
OP_IF
  OP_PUSH <timestamp>
  OP_CHECKLOCKTIMEVERIFY
  OP_DROP
  <pubkey>
  OP_CHECKSIG
OP_ELSE
  <pubkey>
  OP_CHECKSIG
OP_ENDIF
```

This means:
- **Before unlock time**: Cannot spend
- **After unlock time**: Recipient can spend with their private key

## 💡 Use Cases

### 1. **Monthly Subscription Payments**

Instead of paying $10/month, user pays $120 upfront into 12 timelocked addresses:
- Month 1: Unlocks immediately
- Month 2: Unlocks in 30 days
- Month 3: Unlocks in 60 days
- ...etc

**Benefits:**
- User pays once
- Platform gets guaranteed revenue
- User can't access future months early
- Automatic monthly releases

**Implementation:**
```typescript
import { createSubscriptionTimelocks } from '@/lib/bitcoin-timelock'

// Create 12 monthly timelocks
const timelocks = createSubscriptionTimelocks(
  userPublicKey,
  150000, // 0.0015 BTC per month (~$100)
  12,     // 12 months
  new Date()
)

// Send payment to each timelocked address
for (const timelock of timelocks) {
  console.log(`Month ${timelock.month}: ${timelock.address}`)
  console.log(`  Unlocks: ${timelock.unlockDate}`)
  console.log(`  Amount: ${timelock.amount} satoshis`)
}
```

### 2. **Vesting Schedules**

Lock tokens/funds that vest over time:
- 25% unlocks after 3 months
- 25% unlocks after 6 months
- 25% unlocks after 9 months
- 25% unlocks after 12 months

### 3. **Escrow Payments**

Hold funds in escrow until service is delivered:
- Buyer sends to timelocked address
- Seller delivers service
- After confirmation period, funds unlock
- If dispute, admin can refund (with refundable timelock)

### 4. **Referral Bonus Vesting**

Instead of immediate referral bonuses:
- 50% unlocks immediately
- 50% unlocks after 30 days
- Prevents referral fraud

## 📝 Implementation Examples

### Example 1: Create Simple Timelocked Address

```typescript
import { createTimelockedAddress, getUnlockDate } from '@/lib/bitcoin-timelock'

// User's public key
const userPubKey = '02abcdef...' // From their Bitcoin wallet

// Unlock in 30 days
const unlockTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)

const timelock = createTimelockedAddress(userPubKey, unlockTime, true)

console.log('Timelocked Address:', timelock.address)
console.log('Unlocks:', getUnlockDate(timelock.lockTime))
console.log('Redeem Script:', timelock.redeemScript.toString('hex'))

// Store in database
await supabase
  .from('timelocked_addresses')
  .insert({
    user_id: userId,
    address: timelock.address,
    redeem_script_encrypted: encrypt(timelock.redeemScript.toString('hex')),
    lock_time: timelock.lockTime,
    unlock_date: getUnlockDate(timelock.lockTime),
    timelock_type: 'custom',
    expected_amount_satoshis: 100000,
    description: '30-day timelocked payment'
  })
```

### Example 2: Create Refundable Timelock

```typescript
import { createRefundableTimelockedAddress } from '@/lib/bitcoin-timelock'

const timelock = createRefundableTimelockedAddress(
  recipientPubKey,  // Who receives after timelock
  adminPubKey,      // Who can refund
  unlockTime
)

// If recipient doesn't claim, admin can refund
```

### Example 3: Spend Timelocked Funds (After Unlock)

```typescript
import { spendTimelockedUTXO, isTimelockExpired } from '@/lib/bitcoin-timelock'

// Check if timelock has expired
if (!isTimelockExpired(lockTime)) {
  throw new Error('Timelock has not expired yet')
}

// Get UTXOs from timelocked address
const utxos = await getUTXOs(timelockedAddress)

// Decrypt redeem script
const redeemScript = Buffer.from(decrypt(encryptedRedeemScript), 'hex')

// Create spending transaction
const txHex = await spendTimelockedUTXO(
  utxos,
  destinationAddress,
  amount,
  redeemScript,
  privateKeyWIF,
  Date.now()
)

// Broadcast
const txid = await broadcastTransaction(txHex)
```

### Example 4: Subscription Timelocks (Database)

```sql
-- Create 12 monthly timelocks for subscription
SELECT * FROM create_subscription_timelocks(
  'user-uuid-here',
  150000,              -- 0.0015 BTC per month
  12,                  -- 12 months
  NOW()                -- Starting now
);

-- Get user's unlockable timelocks
SELECT * FROM get_unlockable_timelocks('user-uuid-here');

-- Unlock a timelock (when expired)
SELECT unlock_timelock('bc1q...');
```

## 🔍 Checking Timelock Status

### Query Database
```sql
-- Get all pending timelocks for user
SELECT 
  address,
  unlock_date,
  expected_amount_satoshis,
  timelock_type,
  is_funded,
  is_unlocked,
  CASE 
    WHEN unlock_date <= NOW() THEN 'UNLOCKED'
    ELSE 'LOCKED'
  END as status
FROM timelocked_addresses
WHERE user_id = 'user-uuid'
ORDER BY unlock_date ASC;

-- Get total locked balance
SELECT 
  SUM(expected_amount_satoshis) as total_locked,
  SUM(CASE WHEN is_unlocked THEN expected_amount_satoshis ELSE 0 END) as unlocked,
  SUM(CASE WHEN NOT is_unlocked THEN expected_amount_satoshis ELSE 0 END) as still_locked
FROM timelocked_addresses
WHERE user_id = 'user-uuid'
  AND is_funded = TRUE
  AND is_spent = FALSE;
```

### Check Blockchain
```typescript
// Get actual balance of timelocked address
import { getAddressBalance } from '@/lib/bitcoin-split'

const balance = await getAddressBalance(timelockedAddress)
console.log(`Balance: ${balance} satoshis`)

// Check if address has been funded
if (balance > 0) {
  await supabase
    .from('timelocked_addresses')
    .update({ is_funded: true, funded_at: new Date() })
    .eq('address', timelockedAddress)
}
```

## 🎨 UI Components to Build

### 1. Timelock Creation Form
- Select timelock type (subscription/vesting/escrow)
- Set unlock date/duration
- Enter amount
- Generate address + QR code

### 2. Timelock Dashboard
- List of all timelocked addresses
- Unlock countdown timers
- Status indicators (locked/unlocked/spent)
- Total locked balance

### 3. Timelock Spending Interface
- Shows unlockable timelocks
- "Claim Funds" button (when unlocked)
- Transaction history

### 4. Admin Timelock Manager
- View all timelocks across platform
- Monitor subscription timelocks
- Process refunds if needed

## ⚠️ Important Notes

### Timelock Limitations

1. **Immutable**: Once created, timelock cannot be changed
2. **On-chain**: Requires blockchain transaction to spend
3. **Fees**: Each spend transaction requires mining fee
4. **Block Time**: Timestamp timelocks use median of last 11 blocks

### Security Considerations

1. **Private Key Safety**: Store encrypted, never expose to client
2. **Redeem Script**: Must be stored to spend from timelocked address
3. **Backup**: Backup all timelock data (address + redeem script + private key)
4. **Testing**: Always test on testnet first

### Best Practices

1. **Buffer Time**: Add 1-2 hours buffer to unlock times
2. **Confirmation**: Wait for 1-6 confirmations before marking as funded
3. **Monitoring**: Set up alerts for timelock expirations
4. **Documentation**: Keep clear records of all timelocks

## 🧪 Testing on Testnet

```typescript
// Test timelock creation
const testTimelock = createTimelockedAddress(
  testUserPubKey,
  Math.floor(Date.now() / 1000) + 60, // 1 minute for testing
  true
)

console.log('Test Address:', testTimelock.address)
console.log('Unlock in: 60 seconds')

// Send testnet BTC to address
// Wait 60 seconds
// Try to spend
```

## 📚 Resources

- [Bitcoin Wiki: Timelock](https://en.bitcoin.it/wiki/Timelock)
- [BIP65: CHECKLOCKTIMEVERIFY](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki)
- [Bitcoinjs-lib Documentation](https://github.com/bitcoinjs/bitcoinjs-lib)

## 🚀 Next Steps

1. ✅ Run timelock migration
2. ✅ Test timelock creation on testnet
3. ⏳ Build UI components
4. ⏳ Implement subscription timelock flow
5. ⏳ Add timelock monitoring
6. ⏳ Create admin dashboard
7. ⏳ Add email notifications for unlocks
