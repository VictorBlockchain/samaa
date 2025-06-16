import { supabase } from './supabase'

// User profile interface for matching
export interface UserProfile {
  id: string
  wallet_address: string
  name: string
  age: number
  location: {
    city: string
    country: string
    coordinates?: [number, number]
  }
  gender: 'male' | 'female'
  bio: string
  interests: string[]
  islamic_values: {
    prayer_frequency: 'daily' | 'weekly' | 'occasionally' | 'rarely'
    hijab_preference?: 'yes' | 'no' | 'sometimes' // for females
    beard_preference?: 'yes' | 'no' // for males
    islamic_education: 'high' | 'medium' | 'basic'
    marriage_timeline: 'within_year' | 'within_two_years' | 'flexible'
  }
  preferences: {
    age_range: [number, number]
    max_distance: number // in miles
    hijab_only?: boolean // for males looking for females
    education_level?: 'high_school' | 'bachelors' | 'masters' | 'phd'
    occupation_preference?: string[]
  }
  photos: string[]
  video_intro?: string
  voice_intro?: string
  created_at: string
  last_active: string
  is_verified: boolean
  compatibility_score?: number
}

// Match interaction types
export interface MatchInteraction {
  id: string
  from_user: string
  to_user: string
  type: 'message' | 'view_profile'
  message_type?: 'audio' | 'video' | 'text'
  message_content?: string
  message_url?: string
  created_at: string
}

// Matching service
export class MatchingService {
  
  // Calculate compatibility score between two users
  static calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
    let score = 0
    let maxScore = 0

    // Age compatibility (20 points)
    maxScore += 20
    const ageGap = Math.abs(user1.age - user2.age)
    if (ageGap <= 2) score += 20
    else if (ageGap <= 5) score += 15
    else if (ageGap <= 8) score += 10
    else if (ageGap <= 12) score += 5

    // Location proximity (15 points)
    maxScore += 15
    if (user1.location.city === user2.location.city) score += 15
    else if (user1.location.country === user2.location.country) score += 10
    else score += 5

    // Islamic values alignment (25 points)
    maxScore += 25
    if (user1.islamic_values.prayer_frequency === user2.islamic_values.prayer_frequency) score += 10
    if (user1.islamic_values.islamic_education === user2.islamic_values.islamic_education) score += 8
    if (user1.islamic_values.marriage_timeline === user2.islamic_values.marriage_timeline) score += 7

    // Shared interests (20 points)
    maxScore += 20
    const sharedInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    ).length
    score += Math.min(sharedInterests * 4, 20)

    // Preference matching (20 points)
    maxScore += 20
    // Age preference
    if (user2.age >= user1.preferences.age_range[0] && user2.age <= user1.preferences.age_range[1]) score += 10
    if (user1.age >= user2.preferences.age_range[0] && user1.age <= user2.preferences.age_range[1]) score += 10

    return Math.round((score / maxScore) * 100)
  }

  // Get potential matches for a user
  static async getPotentialMatches(userWallet: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      // Get current user's profile and preferences
      const { data: currentUser, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', userWallet)
        .single()

      if (userError || !currentUser) {
        console.error('Error fetching user profile:', userError)
        return this.getMockMatches(userWallet, limit)
      }

      // Get users of opposite gender within age and distance preferences
      const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male'
      
      const { data: potentialMatches, error: matchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('gender', oppositeGender)
        .gte('age', currentUser.preferences.age_range[0])
        .lte('age', currentUser.preferences.age_range[1])
        .neq('wallet_address', userWallet)
        .limit(limit * 2) // Get more to filter and sort

      if (matchError) {
        console.error('Error fetching potential matches:', matchError)
        return this.getMockMatches(userWallet, limit)
      }

      // Calculate compatibility scores and sort
      const matchesWithScores = (potentialMatches || []).map(match => ({
        ...match,
        compatibility_score: this.calculateCompatibility(currentUser, match)
      })).sort((a, b) => b.compatibility_score - a.compatibility_score)

      return matchesWithScores.slice(0, limit)
    } catch (error) {
      console.error('Error in getPotentialMatches:', error)
      return this.getMockMatches(userWallet, limit)
    }
  }

  // Get users who sent messages to the current user
  static async getUsersWhoMessagedMe(userWallet: string): Promise<UserProfile[]> {
    try {
      const { data: interactions, error } = await supabase
        .from('match_interactions')
        .select(`
          from_user,
          user_profiles!match_interactions_from_user_fkey(*)
        `)
        .eq('to_user', userWallet)
        .eq('type', 'message')

      if (error) {
        console.error('Error fetching users who messaged me:', error)
        return this.getMockMessagesReceived(userWallet)
      }

      return interactions?.map(interaction => interaction.user_profiles) || []
    } catch (error) {
      console.error('Error in getUsersWhoMessagedMe:', error)
      return this.getMockMessagesReceived(userWallet)
    }
  }

  // Get users the current user messaged
  static async getUsersIMessaged(userWallet: string): Promise<UserProfile[]> {
    try {
      const { data: interactions, error } = await supabase
        .from('match_interactions')
        .select(`
          to_user,
          user_profiles!match_interactions_to_user_fkey(*)
        `)
        .eq('from_user', userWallet)
        .eq('type', 'message')

      if (error) {
        console.error('Error fetching users I messaged:', error)
        return this.getMockMessagesSent(userWallet)
      }

      return interactions?.map(interaction => interaction.user_profiles) || []
    } catch (error) {
      console.error('Error in getUsersIMessaged:', error)
      return this.getMockMessagesSent(userWallet)
    }
  }

  // Record a message interaction
  static async recordMessage(
    fromUser: string,
    toUser: string,
    messageType: 'audio' | 'video' | 'text',
    messageContent?: string,
    messageUrl?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('match_interactions')
        .insert({
          from_user: fromUser,
          to_user: toUser,
          type: 'message',
          message_type: messageType,
          message_content: messageContent,
          message_url: messageUrl,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error recording message:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in recordMessage:', error)
      return false
    }
  }

  // Record a profile view
  static async recordProfileView(fromUser: string, toUser: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('match_interactions')
        .insert({
          from_user: fromUser,
          to_user: toUser,
          type: 'view_profile',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error recording profile view:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in recordProfileView:', error)
      return false
    }
  }

  // Mock data for development
  static getMockMatches(userWallet: string, limit: number): UserProfile[] {
    const mockProfiles: UserProfile[] = [
      {
        id: '1',
        wallet_address: 'mock1',
        name: 'Aisha Rahman',
        age: 26,
        location: { city: 'London', country: 'UK' },
        gender: 'female',
        bio: 'Software engineer who loves reading Quran and hiking. Looking for someone who shares my values and dreams.',
        interests: ['Reading', 'Technology', 'Islamic Studies', 'Hiking', 'Cooking'],
        islamic_values: {
          prayer_frequency: 'daily',
          hijab_preference: 'yes',
          islamic_education: 'high',
          marriage_timeline: 'within_year'
        },
        preferences: {
          age_range: [25, 35],
          max_distance: 50,
          education_level: 'bachelors'
        },
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'],
        created_at: '2024-01-15T10:00:00Z',
        last_active: '2024-01-20T15:30:00Z',
        is_verified: true,
        compatibility_score: 92
      },
      {
        id: '2',
        wallet_address: 'mock2',
        name: 'Omar Hassan',
        age: 29,
        location: { city: 'Toronto', country: 'Canada' },
        gender: 'male',
        bio: 'Doctor passionate about helping others. Love traveling and learning about different cultures.',
        interests: ['Medicine', 'Travel', 'Photography', 'Islamic History', 'Sports'],
        islamic_values: {
          prayer_frequency: 'daily',
          beard_preference: 'yes',
          islamic_education: 'high',
          marriage_timeline: 'within_year'
        },
        preferences: {
          age_range: [22, 30],
          max_distance: 100,
          hijab_only: true
        },
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
        created_at: '2024-01-10T08:00:00Z',
        last_active: '2024-01-20T12:00:00Z',
        is_verified: true,
        compatibility_score: 88
      },
      {
        id: '3',
        wallet_address: 'mock3',
        name: 'Fatima Al-Zahra',
        age: 24,
        location: { city: 'Dubai', country: 'UAE' },
        gender: 'female',
        bio: 'Teacher who loves children and education. Seeking a kind and practicing Muslim for marriage.',
        interests: ['Education', 'Children', 'Art', 'Calligraphy', 'Volunteering'],
        islamic_values: {
          prayer_frequency: 'daily',
          hijab_preference: 'yes',
          islamic_education: 'high',
          marriage_timeline: 'within_two_years'
        },
        preferences: {
          age_range: [26, 35],
          max_distance: 25,
          education_level: 'bachelors'
        },
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'],
        created_at: '2024-01-12T14:00:00Z',
        last_active: '2024-01-19T18:45:00Z',
        is_verified: true,
        compatibility_score: 85
      }
    ]

    return mockProfiles.slice(0, limit)
  }

  static getMockMessagesReceived(userWallet: string): UserProfile[] {
    return this.getMockMatches(userWallet, 2)
  }

  static getMockMessagesSent(userWallet: string): UserProfile[] {
    return this.getMockMatches(userWallet, 1)
  }
}
