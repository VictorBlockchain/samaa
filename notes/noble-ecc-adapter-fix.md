# Noble ECC Adapter Fix for Bitcoin route build failure

## Problem statement

The project was failing during Next.js production build when collecting server route data for Bitcoin-related API routes, notably `app/api/bitcoin/check-payment/route.ts` and `app/api/auth/verify-email/route.ts`.

The root cause was a dependency chain that required `tiny-secp256k1` as the `ecc` adapter for `ecpair` and `bip32`. In this environment, `tiny-secp256k1` attempted to load WebAssembly assets, which broke in the Next.js server runtime and caused `ecc library invalid` errors.

## What we needed to solve

- Replace `tiny-secp256k1` with a pure JavaScript ECC adapter based on `@noble/secp256k1`.
- Maintain compatibility with the interface expected by `ecpair` and `bip32`.
- Keep support for both ECDSA and Schnorr signature helpers where required.
- Ensure the adapter works in server-only Next.js API routes and does not require browser-only WASM loading.

## Fix implemented

### `lib/noble-ecc.ts`

- Created a custom adapter that exports the required ECC interface for `ecpair`/`bip32`.
- Used `@noble/secp256k1` for core curve operations.
- Registered `hashes.sha256` and `hashes.hmacSha256` using `@noble/hashes/sha256` and `@noble/hashes/hmac`.
- Implemented adapter methods:
  - `isPoint`
  - `isPrivate`
  - `pointFromScalar`
  - `pointCompress`
  - `pointAdd`
  - `pointAddScalar`
  - `pointMultiply`
  - `xOnlyPointFromScalar`
  - `xOnlyPointFromPoint`
  - `xOnlyPointAddTweak`
  - `privateAdd`
  - `privateNegate`
  - `sign`
  - `verify`
  - `signSchnorr`
  - `verifySchnorr`

### Key compatibility changes

- `sign()` now returns compact 64-byte ECDSA signatures, matching `ecpair`/`bip32` expectations.
- `verify()` now accepts compact signatures directly, instead of DER-encoded values.
- `signSchnorr()` and `verifySchnorr()` were implemented as synchronous wrappers to match the expected API shape.

## Validation and testing

- Compiled `lib/noble-ecc.ts` and ran `ecpair`'s built-in compatibility test `testEcc(ecc)` against the adapter.
- Verified the adapter passed every `testEcc` assertion.
- Confirmed `pnpm exec next build` now succeeds and generates page data and API routes successfully.

## Errors fixed / eliminated

- `Error: ecc library invalid`
- `tiny-secp256k1` WASM loading failure in Next.js server environment
- incompatible `sign()`/`verify()` behavior for `ecpair` expectations
- asynchronous Schnorr wrappers causing invalid input handling in compatibility tests

## Notes / future follow-up

- If the app no longer needs `tiny-secp256k1`, consider removing it from `package.json` and pruning the package.
- The fix is currently isolated to the adapter layer and should be reusable for other Bitcoin signing or key derivation logic in this repo.
- Keep an eye on `@noble/secp256k1` API changes if upgrading, since the adapter relies on its compact signature and Schnorr APIs.
