import { useState, useEffect } from 'react'

// Import mock data
import usersData from '@/data/users.json'
import matchesData from '@/data/matches.json'
import messagesData from '@/data/messages.json'
import interestsData from '@/data/interests.json'

// Types based on our mock data structure
export interface User {
  id: string
  name: string
  age: number
  bio: string
  location: {
    city: string
    state: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  interests: string[]
  religion: string
  sect: string
  education: string
  occupation: string
  photos: string[]
  bioRating: number
  isVerified: boolean
  walletAddress: string
  hasDowryWallet: boolean
  hasPurseWallet: boolean
  dowryBalance?: number
  purseBalance?: number
  isOnline: boolean
  lastActive: string
  joinedDate: string
  preferences: {
    ageRange: { min: number; max: number }
    maxDistance: number
    education: string[]
    occupation: string[]
    sect: string[]
  }
}

export interface Match {
  id: string
  userId: string
  matchedUserId: string
  compatibilityScore: number
  status: 'pending' | 'accepted' | 'rejected'
  matchType: 'algorithm' | 'mutual_like'
  createdAt: string
  updatedAt: string
  distance: number
  commonInterests: string[]
  matchReason: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  type: 'audio' | 'video' | 'text'
  content: {
    audioUrl?: string
    videoUrl?: string
    thumbnailUrl?: string
    duration?: number
    transcript?: string
    text?: string
  }
  isRead: boolean
  isPlaying: boolean
  sentAt: string
  readAt: string | null
  metadata: {
    fileSize: string
    format: string
    quality: string
  }
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: string
  lastActivity: string
  isActive: boolean
}

// Custom hook for mock data
export function useMockData() {
  const [users, setUsers] = useState<User[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [interests, setInterests] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const loadData = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(usersData.users as User[])
      setMatches(matchesData.matches as Match[])
      setMessages(messagesData.messages as Message[])
      setConversations(messagesData.conversations as Conversation[])
      setInterests(interestsData)
      
      setLoading(false)
    }

    loadData()
  }, [])

  // Helper functions
  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id)
  }

  const getUserMatches = (userId: string): Match[] => {
    return matches.filter(match => 
      match.userId === userId || match.matchedUserId === userId
    )
  }

  const getUserMessages = (userId: string): Message[] => {
    return messages.filter(message => 
      message.senderId === userId || message.recipientId === userId
    )
  }

  const getUserConversations = (userId: string): Conversation[] => {
    return conversations.filter(conv => 
      conv.participants.includes(userId)
    )
  }

  const getCompatibleUsers = (currentUserId: string, limit: number = 10): User[] => {
    const currentUser = getUserById(currentUserId)
    if (!currentUser) return []

    return users
      .filter(user => user.id !== currentUserId)
      .map(user => ({
        ...user,
        compatibilityScore: calculateCompatibility(currentUser, user)
      }))
      .sort((a, b) => (b as any).compatibilityScore - (a as any).compatibilityScore)
      .slice(0, limit)
  }

  const calculateCompatibility = (user1: User, user2: User): number => {
    let score = 0

    // Religion compatibility (30%)
    if (user1.religion === user2.religion && user1.sect === user2.sect) {
      score += 0.3
    }

    // Age preference compatibility (20%)
    if (user2.age >= user1.preferences.ageRange.min && 
        user2.age <= user1.preferences.ageRange.max) {
      score += 0.2
    }

    // Interest overlap (30%)
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    )
    score += Math.min(commonInterests.length * 0.05, 0.3)

    // Education compatibility (10%)
    if (user1.preferences.education.includes(user2.education)) {
      score += 0.1
    }

    // Occupation compatibility (10%)
    if (user1.preferences.occupation.includes(user2.occupation)) {
      score += 0.1
    }

    return Math.min(score, 1) // Cap at 1.0
  }

  const calculateDistance = (user1: User, user2: User): number => {
    const lat1 = user1.location.coordinates.lat
    const lng1 = user1.location.coordinates.lng
    const lat2 = user2.location.coordinates.lat
    const lng2 = user2.location.coordinates.lng

    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const searchUsers = (query: string, filters?: any): User[] => {
    return users.filter(user => {
      const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase()) ||
                          user.bio.toLowerCase().includes(query.toLowerCase()) ||
                          user.interests.some(interest => 
                            interest.toLowerCase().includes(query.toLowerCase())
                          )

      if (!matchesQuery) return false

      // Apply filters if provided
      if (filters) {
        if (filters.ageRange) {
          if (user.age < filters.ageRange.min || user.age > filters.ageRange.max) {
            return false
          }
        }
        if (filters.location && user.location.city !== filters.location) {
          return false
        }
        if (filters.education && !filters.education.includes(user.education)) {
          return false
        }
      }

      return true
    })
  }

  return {
    // Data
    users,
    matches,
    messages,
    conversations,
    interests,
    loading,

    // Helper functions
    getUserById,
    getUserMatches,
    getUserMessages,
    getUserConversations,
    getCompatibleUsers,
    calculateCompatibility,
    calculateDistance,
    searchUsers,

    // State setters for updates
    setUsers,
    setMatches,
    setMessages,
    setConversations
  }
}

// Hook for specific user data
export function useUserData(userId: string) {
  const { getUserById, getUserMatches, getUserMessages, getUserConversations, loading } = useMockData()
  
  const user = getUserById(userId)
  const userMatches = getUserMatches(userId)
  const userMessages = getUserMessages(userId)
  const userConversations = getUserConversations(userId)

  return {
    user,
    matches: userMatches,
    messages: userMessages,
    conversations: userConversations,
    loading
  }
}
