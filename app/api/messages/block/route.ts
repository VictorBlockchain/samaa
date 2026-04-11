import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { blockerId, blockedId, reason } = body

    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'blockerId and blockedId are required' },
        { status: 400 }
      )
    }

    if (blockerId === blockedId) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    // Check if already blocked
    const { data: existingBlock } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single()

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 409 }
      )
    }

    // Create block
    const { data, error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason: reason || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error blocking user:', error)
      return NextResponse.json(
        { error: 'Failed to block user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, block: data })
  } catch (error) {
    console.error('Block user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const blockerId = searchParams.get('blockerId')
    const blockedId = searchParams.get('blockedId')

    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'blockerId and blockedId are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)

    if (error) {
      console.error('Error unblocking user:', error)
      return NextResponse.json(
        { error: 'Failed to unblock user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unblock user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get all blocked users
    const { data: blockedUsers, error } = await supabase
      .from('user_blocks')
      .select(`
        id,
        blocked_id,
        reason,
        created_at,
        blocked:users!user_blocks_blocked_id_fkey (
          id,
          full_name,
          profile_photo
        )
      `)
      .eq('blocker_id', userId)

    if (error) {
      console.error('Error fetching blocked users:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch blocked users', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ blockedUsers: blockedUsers || [] })
  } catch (error) {
    console.error('Get blocked users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
