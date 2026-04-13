# Bitcoin Network Switching Guide

## Current Setup: TESTNET (Testing)

Your `.env.local` currently has:
```env
NODE_ENV=development
```

This generates **testnet** addresses (start with `tb1`) which use test Bitcoin with no real value.

---

## 🚀 Switching to MAINNET (Production)

### When You're Ready for Real Bitcoin:

#### Step 1: Update .env.local
```bash
# Change this line in .env.local:
NODE_ENV=production
```

#### Step 2: Generate Mainnet Keys
```bash
# Run the key generation script
NODE_ENV=production npx tsx scripts/generate-bitcoin-keys.ts
```

You'll see:
```
🌐 Network: MAINNET 🚨 REAL BITCOIN - USE WITH CAUTION!
```

And addresses will start with `bc1` instead of `tb1`.

#### Step 3: Update Environment & Database
The script will output:
1. New encrypted keys for `.env.local`
2. SQL to update `admin_settings` table

#### Step 4: Verify Network
- **Testnet addresses**: `tb1...` (test Bitcoin)
- **Mainnet addresses**: `bc1...` (real Bitcoin)

---

## 📋 Quick Reference

### Test Your Current Setup
```bash
# Check what network you're using
npx tsx scripts/generate-bitcoin-keys.ts

# Look for:
# 🌐 Network: TESTNET 🧪 Test Bitcoin - Safe for testing
# or
# 🌐 Network: MAINNET 🚨 REAL BITCOIN - USE WITH CAUTION!
```

### Force Specific Network (without changing .env.local)
```bash
# Force testnet
NODE_ENV=development npx tsx scripts/generate-bitcoin-keys.ts

# Force mainnet
NODE_ENV=production npx tsx scripts/generate-bitcoin-keys.ts
```

### Network Comparison

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| **NODE_ENV** | `development` | `production` |
| **Address Prefix** | `tb1...` | `bc1...` |
| **Bitcoin Value** | $0 (test coins) | Real value |
| **Get Coins** | Faucets | Purchase/exchange |
| **Use Case** | Testing | Production |
| **Faucet URL** | https://testnet-faucet.mempool.co/ | N/A |

---

## ⚠️ Mainnet Safety Checklist

Before switching to mainnet:

- [ ] Thoroughly tested on testnet
- [ ] All features working correctly
- [ ] Backup unencrypted private keys securely
- [ ] ENCRYPTION_KEY is strong and secure
- [ ] Database backups are current
- [ ] Start with small test transactions
- [ ] Verify addresses before sending funds
- [ ] Consider hardware wallet integration
- [ ] Have recovery plan if keys are lost

---

## 🔑 Key Differences

### Testnet (Current)
```
Address: tb1q7h2f2pseyhgkdhw9lj6egqcd22pvzk29gu9454
Network: Test
Value: $0
Safe for: Testing, development
```

### Mainnet (Production)
```
Address: bc1q... (will be generated)
Network: Main
Value: Real Bitcoin
Requires: Extra security measures
```

---

## 🔄 Switching Back and Forth

You can switch between networks at any time:

```bash
# Back to testnet
NODE_ENV=development npx tsx scripts/generate-bitcoin-keys.ts

# To mainnet
NODE_ENV=production npx tsx scripts/generate-bitcoin-keys.ts
```

⚠️ **Important**: Each network generates completely different keys and addresses!
- Testnet keys cannot access mainnet funds
- Mainnet keys cannot access testnet funds
- Keep them separate and clearly labeled

---

## 💡 Pro Tips

1. **Keep testnet for development** - Even after launching mainnet
2. **Use separate databases** - One for testnet, one for mainnet
3. **Label everything clearly** - Avoid confusion between networks
4. **Test withdrawal flows** - On testnet before mainnet
5. **Monitor transactions** - Use blockchain explorers:
   - Testnet: https://blockstream.info/testnet/
   - Mainnet: https://blockstream.info/

---

## 📞 Need Help?

If you're unsure about switching to mainnet:
1. Keep using testnet until you're 100% confident
2. Test all features thoroughly
3. Start with tiny amounts (like $1 worth)
4. Gradually increase as you gain confidence

Remember: **There's no rush!** Testnet exists for a reason.
