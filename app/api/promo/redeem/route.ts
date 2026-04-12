import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json()

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Code and userId are required' },
        { status: 400 }
      )
    }

    console.log('[redeem-promo] Redeeming code:', code, 'for user:', userId)

    // Call the database function to redeem promo code
    const { data, error } = await supabaseAdmin.rpc('redeem_promo_code', {
      p_code: code,
      p_user_id: userId,
    })

    if (error) {
      console.error('[redeem-promo] Error redeeming promo:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to redeem promo code' },
        { status: 500 }
      )
    }

    if (!data?.success) {
      return NextResponse.json(
        { error: data?.error || 'Failed to redeem promo code' },
        { status: 400 }
      )
    }

    console.log('[redeem-promo] Successfully redeemed:', data)

    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error: any) {
    console.error('[redeem-promo] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to redeem promo code' },
      { status: 500 }
    )
  }
}
