import { supabase } from './supabase'

// Message interface for the messaging system
export interface Message {
  id: string
  conversation_id: string
  sender_wallet: string
  recipient_wallet: string
  type: 'audio' | 'video' | 'text'
  content: {
    text?: string
    audio_url?: string
    video_url?: string
    thumbnail_url?: string
    duration?: number
    transcript?: string
  }
  is_read: boolean
  sent_at: string
  read_at?: string
  metadata?: {
    file_size?: string
    format?: string
    quality?: string
  }
}

// Conversation interface
export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message?: Message
  last_activity: string
  unread_count: number
  created_at: string
}

// Message service for handling all message operations
export class MessageService {
  
  // Get recent conversations for a user
  static async getRecentConversations(userWallet: string, limit: number = 10): Promise<Conversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!conversations_id_fkey(*)
        `)
        .or(`participant_1.eq.${userWallet},participant_2.eq.${userWallet}`)
        .order('last_activity', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching conversations:', error)
        return this.getMockConversations(userWallet)
      }

      // Process conversations to include last message
      const processedConversations = conversations?.map(conv => ({
        ...conv,
        last_message: conv.messages?.[0] || null,
        unread_count: conv.messages?.filter(msg => 
          !msg.is_read && msg.recipient_wallet === userWallet
        ).length || 0
      })) || []

      return processedConversations
    } catch (error) {
      console.error('Error in getRecentConversations:', error)
      return this.getMockConversations(userWallet)
    }
  }

  // Get messages for a specific conversation
  static async getConversationMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching messages:', error)
        return []
      }

      return messages || []
    } catch (error) {
      console.error('Error in getConversationMessages:', error)
      return []
    }
  }

  // Send a new message
  static async sendMessage(
    senderWallet: string,
    recipientWallet: string,
    type: 'audio' | 'video' | 'text',
    content: Message['content']
  ): Promise<boolean> {
    try {
      // First, find or create conversation
      const conversationId = await this.getOrCreateConversation(senderWallet, recipientWallet)
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_wallet: senderWallet,
          recipient_wallet: recipientWallet,
          type,
          content,
          is_read: false,
          sent_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error sending message:', error)
        return false
      }

      // Update conversation last_activity
      await supabase
        .from('conversations')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', conversationId)

      return true
    } catch (error) {
      console.error('Error in sendMessage:', error)
      return false
    }
  }

  // Get or create conversation between two users
  static async getOrCreateConversation(user1: string, user2: string): Promise<string> {
    try {
      // Check if conversation exists
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`)
        .single()

      if (existing) {
        return existing.id
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user1,
          participant_2: user2,
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createError || !newConv) {
        throw new Error('Failed to create conversation')
      }

      return newConv.id
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error)
      // Return a mock ID for development
      return `mock-${user1}-${user2}`
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userWallet: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_wallet', userWallet)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking messages as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
      return false
    }
  }

  // Get unread message count for user
  static async getUnreadCount(userWallet: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_wallet', userWallet)
        .eq('is_read', false)

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      return 0
    }
  }

  // Mock data for development
  static getMockConversations(userWallet: string): Conversation[] {
    const mockMessages: Message[] = [
      {
        id: '1',
        conversation_id: 'conv-1',
        sender_wallet: 'mock1',
        recipient_wallet: userWallet,
        type: 'audio',
        content: {
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          duration: 15,
          transcript: 'Assalamu alaikum, I saw your profile and would love to get to know you better...'
        },
        is_read: false,
        sent_at: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        conversation_id: 'conv-2',
        sender_wallet: userWallet,
        recipient_wallet: 'mock2',
        type: 'video',
        content: {
          video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          duration: 30
        },
        is_read: true,
        sent_at: '2024-01-19T15:45:00Z'
      },
      {
        id: '3',
        conversation_id: 'conv-3',
        sender_wallet: 'mock3',
        recipient_wallet: userWallet,
        type: 'text',
        content: {
          text: 'Thank you for your message! I would be happy to continue our conversation. When would be a good time to talk?'
        },
        is_read: false,
        sent_at: '2024-01-18T20:15:00Z'
      }
    ]

    return [
      {
        id: 'conv-1',
        participant_1: 'mock1',
        participant_2: userWallet,
        last_message: mockMessages[0],
        last_activity: '2024-01-20T10:30:00Z',
        unread_count: 1,
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'conv-2',
        participant_1: userWallet,
        participant_2: 'mock2',
        last_message: mockMessages[1],
        last_activity: '2024-01-19T15:45:00Z',
        unread_count: 0,
        created_at: '2024-01-19T15:00:00Z'
      },
      {
        id: 'conv-3',
        participant_1: 'mock3',
        participant_2: userWallet,
        last_message: mockMessages[2],
        last_activity: '2024-01-18T20:15:00Z',
        unread_count: 1,
        created_at: '2024-01-18T20:00:00Z'
      }
    ]
  }
}
