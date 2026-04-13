import { NextRequest, NextResponse } from 'next/server'
import { fetchBTCPrice } from '@/lib/bitcoin'

export async function GET(request: NextRequest) {
  try {
    const price = await fetchBTCPrice()
    
    return NextResponse.json({
      success: true,
      data: {
        price,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[bitcoin-price] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch BTC price' },
      { status: 500 }
    )
  }
}
