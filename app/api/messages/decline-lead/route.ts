import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { messageId, userId } = body

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'messageId and userId are required' },
        { status: 400 }
      )
    }

    // Verify the user is the receiver of this message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.receiver_id !== userId) {
      return NextResponse.json(
        { error: 'Only the receiver can decline a lead' },
        { status: 403 }
      )
    }

    if (message.type !== 'lead' && message.type !== 'compliment') {
      return NextResponse.json(
        { error: 'Only lead messages can be declined' },
        { status: 400 }
      )
    }

    // Update the message lead_status to declined
    const { data, error } = await supabase
      .from('messages')
      .update({ lead_status: 'declined' })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Error declining lead:', error)
      return NextResponse.json(
        { error: 'Failed to decline lead' },
        { status: 500 }
      )
    }

    // Optionally send notification to sender that lead was declined
    // This could be implemented here if desired

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error('Decline lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { messageId, userId } = body

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'messageId and userId are required' },
        { status: 400 }
      )
    }

    // Verify the user is the receiver of this message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.receiver_id !== userId) {
      return NextResponse.json(
        { error: 'Only the receiver can accept a lead' },
        { status: 403 }
      )
    }

    // Update the message lead_status to accepted
    const { data, error } = await supabase
      .from('messages')
      .update({ lead_status: 'accepted' })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Error accepting lead:', error)
      return NextResponse.json(
        { error: 'Failed to accept lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error('Accept lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
