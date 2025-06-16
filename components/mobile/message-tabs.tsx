"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Video,
  Clock,
  User
} from "lucide-react"
import { MessageService, Conversation, Message } from "@/lib/messages"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

interface MessageTabsProps {
  className?: string
}

export function MessageTabs({ className = "" }: MessageTabsProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { publicKey } = useWallet()
  const router = useRouter()

  // Load conversations when component mounts
  useEffect(() => {
    if (publicKey) {
      loadConversations()
    }
  }, [publicKey, activeTab])

  const loadConversations = async () => {
    if (!publicKey) return
    
    setIsLoading(true)
    try {
      const convs = await MessageService.getRecentConversations(publicKey.toString(), 5)
      
      // Filter based on active tab
      const filteredConvs = convs.filter(conv => {
        if (!conv.last_message) return false
        
        if (activeTab === 'received') {
          return conv.last_message.recipient_wallet === publicKey.toString()
        } else {
          return conv.last_message.sender_wallet === publicKey.toString()
        }
      })
      
      setConversations(filteredConvs)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayMessage = async (message: Message) => {
    if (playingMessage === message.id) {
      // Stop playing
      setPlayingMessage(null)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
      return
    }

    setPlayingMessage(message.id)

    if (message.type === 'audio' && message.content.audio_url) {
      if (audioRef.current) {
        audioRef.current.src = message.content.audio_url
        audioRef.current.muted = isMuted
        try {
          await audioRef.current.play()
        } catch (error) {
          console.error('Error playing audio:', error)
          setPlayingMessage(null)
        }
      }
    } else if (message.type === 'video' && message.content.video_url) {
      if (videoRef.current) {
        videoRef.current.src = message.content.video_url
        videoRef.current.muted = isMuted
        try {
          await videoRef.current.play()
        } catch (error) {
          console.error('Error playing video:', error)
          setPlayingMessage(null)
        }
      }
    }
  }

  const handleMessageEnd = () => {
    setPlayingMessage(null)
  }

  const handleConversationClick = (conversation: Conversation) => {
    const otherParticipant = conversation.participant_1 === publicKey?.toString() 
      ? conversation.participant_2 
      : conversation.participant_1
    
    router.push(`/messages/${otherParticipant}`)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getMessagePreview = (message: Message) => {
    switch (message.type) {
      case 'audio':
        return message.content.transcript || 'Audio message'
      case 'video':
        return 'Video message'
      case 'text':
        return message.content.text || 'Text message'
      default:
        return 'Message'
    }
  }

  const getOtherParticipantName = (conversation: Conversation) => {
    // In a real app, you'd fetch the user profile
    const otherWallet = conversation.participant_1 === publicKey?.toString() 
      ? conversation.participant_2 
      : conversation.participant_1
    
    // Mock names for demo
    const mockNames: { [key: string]: string } = {
      'mock1': 'Aisha Rahman',
      'mock2': 'Omar Hassan',
      'mock3': 'Fatima Al-Zahra'
    }
    
    return mockNames[otherWallet] || `${otherWallet.slice(0, 6)}...${otherWallet.slice(-4)}`
  }

  return (
    <div className={`${className}`}>
      {/* Hidden audio/video elements */}
      <audio
        ref={audioRef}
        onEnded={handleMessageEnd}
        onError={handleMessageEnd}
        className="hidden"
      />
      <video
        ref={videoRef}
        onEnded={handleMessageEnd}
        onError={handleMessageEnd}
        className="hidden"
      />

      {/* Tab Headers */}
      <div className="flex mb-4">
        <div className="grid grid-cols-2 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
          <button
            onClick={() => setActiveTab('received')}
            className={`relative p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'received'
                ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                : "hover:bg-white/10 border border-transparent"
            }`}
          >
            <div className="text-2xl mb-1">💌</div>
            <div className="text-xs font-queensides text-slate-600 leading-tight">Messages Received</div>
            {activeTab === 'received' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`relative p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'sent'
                ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                : "hover:bg-white/10 border border-transparent"
            }`}
          >
            <div className="text-2xl mb-1">📤</div>
            <div className="text-xs font-queensides text-slate-600 leading-tight">Messages Sent</div>
            {activeTab === 'sent' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-slate-600 font-queensides">Loading messages...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 font-qurova mb-2">
              {activeTab === 'received' ? 'No Messages Received' : 'No Messages Sent'}
            </h3>
            <p className="text-slate-600 font-queensides text-sm">
              {activeTab === 'received' 
                ? 'When someone sends you a message, it will appear here'
                : 'Start exploring matches and send your first message'
              }
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {conversations.map((conversation, index) => {
              const message = conversation.last_message!
              const isPlaying = playingMessage === message.id
              
              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleConversationClick(conversation)}
                  className="relative group bg-white/60 backdrop-blur-sm border border-indigo-200/50 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 cursor-pointer"
                >
                  {/* Arabic-inspired corner decorations */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-indigo-300/40 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-purple-300/40 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-purple-300/40 rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-indigo-300/40 rounded-br-lg"></div>

                  <div className="flex items-center space-x-3">
                    {/* Profile Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-indigo-200/50">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-800 font-queensides text-sm truncate">
                          {getOtherParticipantName(conversation)}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500 font-queensides">
                            {formatTimeAgo(message.sent_at)}
                          </span>
                          {conversation.unread_count > 0 && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Message Type Icon & Play Button */}
                        {(message.type === 'audio' || message.type === 'video') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayMessage(message)
                            }}
                            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Play className="w-4 h-4 text-indigo-600" />
                            )}
                          </button>
                        )}
                        
                        {/* Message Preview */}
                        <p className="text-sm text-slate-600 font-queensides truncate flex-1">
                          {message.type === 'audio' && '🎵 '}
                          {message.type === 'video' && '🎥 '}
                          {getMessagePreview(message)}
                        </p>
                        
                        {/* Duration for audio/video */}
                        {message.content.duration && (
                          <span className="text-xs text-slate-500 font-queensides">
                            {Math.floor(message.content.duration / 60)}:{(message.content.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Mute Toggle */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl border border-indigo-200/50 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-600" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-600" />
          )}
          <span className="text-sm font-queensides text-slate-600">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>
      </div>
    </div>
  )
}
