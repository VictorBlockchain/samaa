# Bitcoin Payment System Setup

## Overview
The app now uses Bitcoin payments instead of Stripe for subscriptions, views, and leads purchases.

## Setup Steps

### 1. Environment Variables
Add your XPUB key to `.env.local`:
```env
XPUB_KEY=your_extended_public_key_here
```

**How to get an XPUB:**
- Generate from your Bitcoin wallet (Electrum, BlueWallet, etc.)
- Use a dedicated wallet for receiving payments
- Keep your private keys secure!

### 2. Run Database Migration
Run this SQL in your Supabase SQL Editor:
```bash
# File: schema/migrations/2026-04-15_create_bitcoin_payments.sql
```

This creates:
- `bitcoin_payments` table
- `last_btc_address_index` column in users table
- `get_next_btc_address_index()` function
- `confirm_bitcoin_payment()` function
- RLS policies

### 3. Test the System

#### Development Mode (Testnet)
The system automatically uses Bitcoin testnet when `NODE_ENV !== 'production'`

To test:
1. Get testnet BTC from a faucet: https://testnet-faucet.mempool.co/
2. Use a testnet-compatible wallet
3. Make a purchase from the wallet page

#### Production Mode (Mainnet)
When deployed to production (`NODE_ENV=production`), it uses Bitcoin mainnet.

## How It Works

### Payment Flow
1. User selects a product (subscription/views/leads)
2. System generates unique Bitcoin address from XPUB
3. Shows QR code and address with 30-minute countdown
4. User sends exact BTC amount
5. User clicks "Check Payment" button
6. System queries Blockstream API to verify payment
7. If confirmed, auto-credits user account
8. Redirects to wallet/success page

### Address Management
- Each user gets a unique derived address (m/0/index path)
- Addresses are reused if there's a pending payment
- Index is tracked in users.last_btc_address_index
- Prevents address reuse across different payments

### Payment Verification
- Uses Blockstream.info API (free, no API key needed)
- Checks for transactions to the payment address
- Verifies amount matches or exceeds expected satoshis
- Auto-confirms and credits on detection

### Pricing
- Fetches real-time BTC/USD from CoinGecko API
- Converts USD price to satoshis
- Updates price at payment creation time

## API Endpoints

### POST `/api/bitcoin/create-payment`
Creates a new Bitcoin payment
```json
{
  "userId": "user-uuid",
  "paymentType": "subscription|views|leads",
  "amount": 9.99
}
```

Returns:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "bitcoinAddress": "bc1q...",
    "amountSatoshis": 15000,
    "amountBTC": "0.00015000",
    "amountUSD": 9.99,
    "btcPrice": 66600.00,
    "bitcoinURI": "bitcoin:bc1q...?amount=...",
    "expiresAt": "2026-04-15T..."
  }
}
```

### POST `/api/bitcoin/check-payment`
Checks payment status
```json
{
  "paymentId": "payment-uuid"
}
```

Returns:
```json
{
  "success": true,
  "paid": true,
  "txid": "transaction-hash",
  "paymentType": "subscription"
}
```

## Security

### RLS Policies
- Users can only view their own payments
- Service role manages all payments
- No direct client-side inserts

### Address Derivation
- Only XPUB is used (read-only, can't spend)
- Private keys never touch the server
- HD wallet ensures unique addresses

### Payment Confirmation
- Server-side verification only
- Prevents client-side manipulation
- Double-spend protection via blockchain

## Monitoring

### Check Payments
Query the database:
```sql
SELECT * FROM bitcoin_payments 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### View Confirmed Payments
```sql
SELECT * FROM bitcoin_payments 
WHERE status = 'confirmed' 
ORDER BY confirmed_at DESC;
```

## Troubleshooting

### Payment Not Detected
- Check if transaction has at least 1 confirmation
- Verify amount sent matches expected satoshis
- Check Blockstream API is accessible
- Manual confirmation: Call `confirm_bitcoin_payment()` function

### Address Generation Error
- Verify XPUB_KEY is set in environment
- Check XPUB format (xpub for mainnet, tpub for testnet)
- Ensure bip32 and bitcoinjs-lib are installed

### Price Fetch Failed
- CoinGecko API may be rate-limited
- Free tier: 10-30 calls/minute
- Consider caching prices for 1-5 minutes

## Production Considerations

### Rate Limiting
- Add rate limiting to API endpoints
- Prevent abuse of payment creation

### Webhook Alternative
For production, consider:
- Running your own Bitcoin node
- Using BTCPay Server (self-hosted)
- Webhook-based payment notifications
- Multi-signature confirmation requirements

### Price Volatility
- Consider adding price buffer (1-2%)
- Lock price for 15-30 minutes
- Auto-expire stale payments

### Backup
- Backup your wallet seed phrase
- Keep XPUB in secure location
- Monitor receiving addresses regularly

## Support
For questions or issues, check the code comments or review the implementation in:
- `lib/bitcoin.ts` - Core Bitcoin functions
- `app/api/bitcoin/` - API endpoints
- `components/wallet/bitcoin-payment.tsx` - UI component
- `schema/migrations/2026-04-15_create_bitcoin_payments.sql` - Database schema
