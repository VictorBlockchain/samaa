"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Heart,
  Send,
  ChevronLeft,
  Search,
  Sparkles,
  Star,
  Mail,
  Bell,
  BellOff,
  User,
  Archive
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/app/context/AuthContext"
import { LeadActions } from "@/components/inbox/lead-actions"
import { ConversationMenu } from "@/components/inbox/conversation-menu"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  type: 'lead' | 'message' | 'compliment'
  lead_status: 'pending' | 'accepted' | 'declined' | null
  created_at: string
  read: boolean
}

interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_photo: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_muted: boolean
  is_archived: boolean
  lead_status: string | null
  chat_rating?: number
}

export default function InboxPage() {
  const router = useRouter()
  const { isAuthenticated, userId, user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isProcessingLead, setIsProcessingLead] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/login')
      return
    }
    loadConversations()
    loadBlockedUsers()
    setupRealtimeSubscription()

    return () => {
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
      }
    }
  }, [isAuthenticated, userId, showArchived])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Show browser notification if permitted
          if (Notification.permission === 'granted' && document.hidden) {
            new Notification('New Message on Samaa', {
              body: `${newMessage.sender_id === activeConversation?.participant_id ? activeConversation.participant_name : 'Someone'} sent you a message`,
              icon: '/placeholder-logo.png'
            })
          }

          // Refresh conversations
          loadConversations()
          
          // If in active conversation, add message
          if (activeConversation && 
              (newMessage.sender_id === activeConversation.participant_id || 
               newMessage.receiver_id === activeConversation.participant_id)) {
            setMessages(prev => [...prev, newMessage])
            markAsRead(newMessage.id)
          }
        }
      )
      .subscribe()

    setRealtimeChannel(channel)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadBlockedUsers = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/messages/block?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBlockedUsers(data.blockedUsers.map((b: any) => b.blocked_id))
      }
    } catch (error) {
      console.error('Error loading blocked users:', error)
    }
  }

  const loadConversations = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      // Use the RPC function for optimized query
      const { data, error } = await supabase
        .rpc('get_conversations_with_prefs', { p_user_id: userId })

      if (error) throw error

      // Fetch chat ratings for participants
      const participantIds = data?.map((c: any) => c.partner_id) || []
      let chatRatings: Record<string, number> = {}
      
      if (participantIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, chat_rating')
          .in('id', participantIds)
        
        usersData?.forEach((u: any) => {
          chatRatings[u.id] = u.chat_rating || 0
        })
      }

      const formattedConversations: Conversation[] = (data || [])
        .filter((conv: any) => showArchived ? conv.is_archived : !conv.is_archived)
        .map((conv: any) => ({
          id: conv.partner_id,
          participant_id: conv.partner_id,
          participant_name: conv.partner_name || 'User',
          participant_photo: conv.partner_photo || '/placeholder-user.jpg',
          last_message: conv.last_message,
          last_message_time: conv.last_message_time,
          unread_count: parseInt(conv.unread_count) || 0,
          is_muted: conv.is_muted,
          is_archived: conv.is_archived,
          lead_status: conv.lead_status,
          chat_rating: chatRatings[conv.partner_id] || 0
        }))

      setConversations(formattedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversation: Conversation) => {
    if (!userId) return
    
    setActiveConversation(conversation)
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${conversation.participant_id}),and(sender_id.eq.${conversation.participant_id},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark unread messages as read
      const unreadMessages = data?.filter((m: Message) => m.receiver_id === userId && !m.read) || []
      for (const msg of unreadMessages) {
        await markAsRead(msg.id)
      }

      // Update chat rating
      await updateChatRating()
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const updateChatRating = async () => {
    if (!userId) return
    
    try {
      await supabase.rpc('update_chat_rating', { p_user_id: userId })
    } catch (error) {
      console.error('Error updating chat rating:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !userId) return

    // Check if user is blocked
    if (blockedUsers.includes(activeConversation.participant_id)) {
      alert('You cannot send messages to this user.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: activeConversation.participant_id,
          content: newMessage.trim(),
          type: 'message',
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single()

      if (error) throw error
      
      setNewMessage('')
      setMessages(prev => [...prev, data])
      
      // Send email notification
      await sendEmailNotification(activeConversation.participant_id, newMessage.trim())
      
      // Refresh conversations
      loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const sendEmailNotification = async (receiverId: string, messagePreview: string) => {
    try {
      await fetch('/api/messages/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: Date.now().toString(),
          senderId: userId,
          receiverId: receiverId,
          senderName: user?.user_metadata?.full_name || 'Someone',
          messagePreview: messagePreview.substring(0, 100)
        })
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const handleAcceptLead = async (messageId: string) => {
    setIsProcessingLead(true)
    try {
      const response = await fetch('/api/messages/decline-lead', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId })
      })

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, lead_status: 'accepted' } : m
        ))
      }
    } catch (error) {
      console.error('Error accepting lead:', error)
    } finally {
      setIsProcessingLead(false)
    }
  }

  const handleDeclineLead = async (messageId: string) => {
    setIsProcessingLead(true)
    try {
      const response = await fetch('/api/messages/decline-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId })
      })

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, lead_status: 'declined' } : m
        ))
      }
    } catch (error) {
      console.error('Error declining lead:', error)
    } finally {
      setIsProcessingLead(false)
    }
  }

  const handleBlockUser = async () => {
    if (!activeConversation || !userId) return
    
    if (!confirm(`Block ${activeConversation.participant_name}? They won't be able to message you.`)) {
      return
    }

    try {
      const response = await fetch('/api/messages/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockerId: userId,
          blockedId: activeConversation.participant_id
        })
      })

      if (response.ok) {
        setBlockedUsers(prev => [...prev, activeConversation.participant_id])
        setActiveConversation(null)
        loadConversations()
      }
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  const handleMuteConversation = async () => {
    if (!activeConversation || !userId) return

    try {
      await fetch('/api/messages/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          partnerId: activeConversation.participant_id,
          isMuted: !activeConversation.is_muted
        })
      })

      setActiveConversation(prev => prev ? { ...prev, is_muted: !prev.is_muted } : null)
      loadConversations()
    } catch (error) {
      console.error('Error muting conversation:', error)
    }
  }

  const handleArchiveConversation = async () => {
    if (!activeConversation || !userId) return

    try {
      await fetch('/api/messages/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          partnerId: activeConversation.participant_id,
          isArchived: !activeConversation.is_archived
        })
      })

      setActiveConversation(null)
      loadConversations()
    } catch (error) {
      console.error('Error archiving conversation:', error)
    }
  }

  const handleDeleteConversation = async () => {
    if (!activeConversation || !userId) return
    
    if (!confirm('Delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      await fetch('/api/messages/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          partnerId: activeConversation.participant_id,
          deletedAt: new Date().toISOString()
        })
      })

      setActiveConversation(null)
      loadConversations()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const getProfilePhoto = (photo: any): string => {
    if (!photo) return '/placeholder-user.jpg'
    if (Array.isArray(photo)) return photo[0] || '/placeholder-user.jpg'
    return photo
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const isUserBlocked = activeConversation ? blockedUsers.includes(activeConversation.participant_id) : false

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => activeConversation ? setActiveConversation(null) : router.push('/')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-pink-600" />
            </motion.button>
            
            {activeConversation ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={getProfilePhoto(activeConversation.participant_photo)}
                    alt={activeConversation.participant_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
                  />
                  {activeConversation.chat_rating && activeConversation.chat_rating > 70 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h1 className="text-lg font-bold text-slate-800 font-qurova">
                    {activeConversation.participant_name}
                  </h1>
                  {activeConversation.chat_rating ? (
                    <p className="text-xs text-emerald-600 font-queensides">
                      {activeConversation.chat_rating}% response rate
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </motion.div>
                  <h1 className="text-xl font-bold gradient-text font-qurova">Messages</h1>
                </div>
              </div>
            )}
            
            {activeConversation ? (
              <ConversationMenu
                partnerId={activeConversation.participant_id}
                partnerName={activeConversation.participant_name}
                isMuted={activeConversation.is_muted}
                isArchived={activeConversation.is_archived}
                onMute={handleMuteConversation}
                onArchive={handleArchiveConversation}
                onDelete={handleDeleteConversation}
                onBlock={handleBlockUser}
                onViewProfile={() => router.push(`/profile?userId=${activeConversation.participant_id}`)}
                onReport={() => alert('Report feature coming soon')}
              />
            ) : (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  showArchived 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                    : 'bg-pink-100 hover:bg-pink-200 text-pink-600'
                }`}
              >
                <Archive className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {!activeConversation ? (
          /* Conversations List */
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-2 border-pink-400 border-t-transparent rounded-full"
                />
              </div>
            ) : conversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 via-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <MessageCircle className="w-12 h-12 text-pink-400" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 font-qurova mb-2">
                  {showArchived ? 'No Archived Messages' : 'No Messages Yet'}
                </h3>
                <p className="text-slate-500 font-queensides max-w-xs mx-auto">
                  {showArchived 
                    ? 'Archived conversations will appear here' 
                    : 'Start connecting with others by sending leads! Your conversations will appear here.'}
                </p>
                {!showArchived && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/explore')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all font-queensides"
                  >
                    Explore Profiles
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv, index) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadMessages(conv)}
                    className={`w-full p-4 bg-white rounded-2xl border transition-all flex items-center gap-3 shadow-sm hover:shadow-md ${
                      conv.unread_count > 0 
                        ? 'border-pink-300 bg-gradient-to-r from-pink-50/50 to-white' 
                        : 'border-pink-100 hover:border-pink-300'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={getProfilePhoto(conv.participant_photo)}
                        alt={conv.participant_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      {conv.unread_count > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        >
                          {conv.unread_count}
                        </motion.div>
                      )}
                      {conv.chat_rating && conv.chat_rating > 70 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-800 font-queensides truncate">
                          {conv.participant_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conv.is_muted && (
                            <BellOff className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="text-xs text-slate-400 font-queensides whitespace-nowrap">
                            {formatTime(conv.last_message_time)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm font-queensides line-clamp-2 ${
                        conv.unread_count > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'
                      }`}>
                        {conv.lead_status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-amber-600 mr-1">
                            <Sparkles className="w-3 h-3" />
                            New Lead:
                          </span>
                        )}
                        {conv.last_message}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat View */
          <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Blocked User Warning */}
            {isUserBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl"
              >
                <p className="text-sm text-rose-700 font-queensides text-center">
                  You have blocked this user. Unblock them to send messages.
                </p>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] space-y-2 ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}>
                      {/* Lead Actions for received leads */}
                      {msg.type === 'lead' && msg.sender_id !== userId && msg.lead_status !== 'declined' && (
                        <LeadActions
                          messageId={msg.id}
                          leadStatus={msg.lead_status}
                          onAccept={handleAcceptLead}
                          onDecline={handleDeclineLead}
                          isProcessing={isProcessingLead}
                        />
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.sender_id === userId
                            ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-200'
                            : 'bg-white border border-pink-100 text-slate-800 shadow-sm'
                        }`}
                      >
                        {/* Lead Badge */}
                        {msg.type === 'lead' && (
                          <div className={`flex items-center gap-1.5 mb-2 ${
                            msg.sender_id === userId ? 'text-pink-100' : 'text-amber-600'
                          }`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold uppercase tracking-wider font-queensides">
                              {msg.lead_status === 'accepted' ? 'Lead Accepted' : 
                               msg.lead_status === 'declined' ? 'Lead Declined' : 'Lead Message'}
                            </span>
                          </div>
                        )}
                        
                        <p className="font-queensides text-sm leading-relaxed">{msg.content}</p>
                        
                        <p className={`text-xs mt-2 ${
                          msg.sender_id === userId ? 'text-pink-200' : 'text-slate-400'
                        }`}>
                          {formatTime(msg.created_at)}
                          {msg.sender_id === userId && (
                            <span className="ml-2">
                              {msg.read ? 'Read' : 'Sent'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {!isUserBlocked && (
              <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-pink-100">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-5 py-3.5 bg-pink-50/50 border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 font-queensides text-sm transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-200 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
