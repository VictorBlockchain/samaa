import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('conversation_preferences')
      .select('*')
      .eq('user_id', userId)

    if (partnerId) {
      query = query.eq('conversation_partner_id', partnerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ preferences: data })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { userId, partnerId, isMuted, isArchived, deletedAt } = body

    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'userId and partnerId are required' },
        { status: 400 }
      )
    }

    // Check if preference already exists
    const { data: existing } = await supabase
      .from('conversation_preferences')
      .select('id')
      .eq('user_id', userId)
      .eq('conversation_partner_id', partnerId)
      .single()

    let result
    if (existing) {
      // Update existing preference
      const updates: any = {}
      if (isMuted !== undefined) updates.is_muted = isMuted
      if (isArchived !== undefined) updates.is_archived = isArchived
      if (deletedAt !== undefined) updates.deleted_at = deletedAt

      const { data, error } = await supabase
        .from('conversation_preferences')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new preference
      const { data, error } = await supabase
        .from('conversation_preferences')
        .insert({
          user_id: userId,
          conversation_partner_id: partnerId,
          is_muted: isMuted || false,
          is_archived: isArchived || false,
          deleted_at: deletedAt || null
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ success: true, preference: result })
  } catch (error) {
    console.error('Update preferences error:', error)
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
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')

    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'userId and partnerId are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('conversation_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('conversation_partner_id', partnerId)

    if (error) {
      console.error('Error deleting preference:', error)
      return NextResponse.json(
        { error: 'Failed to delete preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete preference error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
