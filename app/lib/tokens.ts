export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export type HexAddress = `0x${string}`

// Optional helper to resolve known token addresses by symbol or env.
// Falls back to ZERO_ADDRESS when unknown or unset.
export function getTokenAddress(symbol?: string): HexAddress {
  const sym = (symbol || '').toUpperCase()
  if (!sym) return ZERO_ADDRESS as HexAddress

  // Example: prefer environment-provided Gamer token address when available.
  if (sym === 'GAMER') {
    const env = process.env.NEXT_PUBLIC_GAMER_TOKEN_ADDRESS
    if (env && env.startsWith('0x') && env.length === 42) {
      return env as HexAddress
    }
    return ZERO_ADDRESS as HexAddress
  }

  // Native currency has no ERC-20 address; represent with ZERO_ADDRESS.
  if (sym === 'SEI' || sym === 'ETH') return ZERO_ADDRESS as HexAddress

  return ZERO_ADDRESS as HexAddress
}