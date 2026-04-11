import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { messageId, senderId, receiverId, senderName, messagePreview } = body

    if (!messageId || !receiverId || !senderName) {
      return NextResponse.json(
        { error: 'messageId, receiverId, and senderName are required' },
        { status: 400 }
      )
    }

    // Check if notification already sent
    const { data: existingNotification } = await supabase
      .from('message_notifications')
      .select('id')
      .eq('message_id', messageId)
      .eq('recipient_id', receiverId)
      .single()

    if (existingNotification) {
      return NextResponse.json(
        { error: 'Notification already sent for this message' },
        { status: 409 }
      )
    }

    // Check if conversation is muted
    const { data: prefs } = await supabase
      .from('conversation_preferences')
      .select('is_muted')
      .eq('user_id', receiverId)
      .eq('conversation_partner_id', senderId)
      .single()

    if (prefs?.is_muted) {
      return NextResponse.json(
        { message: 'Conversation is muted, no notification sent' },
        { status: 200 }
      )
    }

    // Get receiver's email
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', receiverId)
      .single()

    if (receiverError || !receiver?.email) {
      return NextResponse.json(
        { error: 'Receiver email not found' },
        { status: 404 }
      )
    }

    // Send email notification via existing API
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'message',
        email: receiver.email,
        name: receiver.full_name || 'User',
        senderName: senderName,
        messagePreview: messagePreview || 'New message'
      })
    })

    const emailSent = emailResponse.ok

    // Record notification
    const { data: notification, error: notifyError } = await supabase
      .from('message_notifications')
      .insert({
        message_id: messageId,
        recipient_id: receiverId,
        email_sent: emailSent,
        email_sent_at: emailSent ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (notifyError) {
      console.error('Error recording notification:', notifyError)
    }

    return NextResponse.json({
      success: true,
      emailSent,
      notification
    })
  } catch (error) {
    console.error('Send notification error:', error)
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('message_notifications')
      .select(`
        *,
        message:messages (
          id,
          content,
          sender_id,
          created_at
        )
      `)
      .eq('recipient_id', userId)

    if (unreadOnly) {
      query = query.eq('email_sent', false)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notifications: data })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
