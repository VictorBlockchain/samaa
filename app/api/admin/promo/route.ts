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
    const body = await request.json()
    const { 
      code, 
      promo_type, 
      max_uses, 
      amount,
      notes,
      userId 
    } = body

    // Validate required fields
    if (!code || !promo_type || !max_uses) {
      return NextResponse.json(
        { error: 'Code, promo_type, and max_uses are required' },
        { status: 400 }
      )
    }

    // Verify user is admin
    if (userId) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (!userData || userData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized: Admin access required' },
          { status: 403 }
        )
      }
    }

    console.log('[promo-admin] Creating promo code:', code)

    // Prepare data
    const promoData: any = {
      code: code.toUpperCase(),
      promo_type,
      max_uses: parseInt(max_uses) || 1,
      used_count: 0,
      is_active: true,
      created_by: userId || null,
      notes: notes || null,
    }

    // Add amount for views/leads
    if (promo_type === 'views' || promo_type === 'leads') {
      promoData.amount = parseInt(amount) || 0
    }

    // Insert promo code
    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert(promoData)
      .select()
      .single()

    if (error) {
      console.error('[promo-admin] Error creating promo:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Promo code already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create promo code' },
        { status: 500 }
      )
    }

    console.log('[promo-admin] Successfully created promo:', data.code)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('[promo-admin] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create promo code' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[promo-admin] Error fetching promos:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch promo codes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('[promo-admin] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[promo-admin] Error updating promo:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update promo code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('[promo-admin] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update promo code' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('promo_codes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[promo-admin] Error deleting promo:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete promo code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('[promo-admin] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete promo code' },
      { status: 500 }
    )
  }
}
