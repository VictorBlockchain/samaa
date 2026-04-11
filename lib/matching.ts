import { supabase } from './supabase'
import type { Database } from './supabase'

// ── Types ────────────────────────────────────────────────────────────

type UserRow = Database['public']['Tables']['users']['Row']
type SettingsRow = Database['public']['Tables']['user_settings']['Row']

/** Flat profile shape returned to the UI after scoring. */
export interface MatchProfile {
  id: string
  name: string
  age: number
  gender: string
  bio: string
  location: string
  city: string | null
  state: string | null
  country: string | null
  nationality: string | null
  latitude: number | null
  longitude: number | null

  // Media
  profile_photo: string | null
  profile_photos: string[] | null
  additional_photos: any | null
  video_intro: string | null
  voice_intro: string | null

  // Quality / ratings
  profile_rating: number
  chat_rating: number
  response_rate: number
  communication_rating: number
  is_verified: boolean

  // Islamic values
  religiosity: string | null
  prayer_frequency: string | null
  hijab_preference: string | null
  marriage_intention: string | null
  sect: string | null
  islamic_values: string | null
  is_revert: boolean
  halal_food: string | null

  // Lifestyle
  alcohol: string | null
  smoking: string | null
  psychedelics: string | null
  self_care_frequency: string | null
  self_care_budget: string | null
  shopping_frequency: string | null
  finance_style: string | null
  dining_frequency: string | null
  travel_frequency: string | null

  // Education & career
  education: string | null
  profession: string | null

  // Family
  marital_status: string | null
  has_children: boolean
  wants_children: boolean
  willing_to_relocate: boolean
  living_arrangements: string | null

  // Personality & interests
  interests: string[]
  personality: string[]
  height: number | null

  // Computed by algorithm
  compatibility_score: number
  distance_miles: number | null
}

// ── Interest compatibility data (from interests.json) ───────────────

const HIGH_COMPATIBILITY_CLUSTERS: string[][] = [
  ['Quran study', 'Islamic history', 'Hadith study'],
  ['Technology', 'Software development', 'Web3/Blockchain'],
  ['Cooking', 'Healthy eating', 'Nutrition'],
  ['Travel', 'Cultural exploration', 'Languages'],
  ['Family time', 'Parenting', 'Child development'],
  ['Community service', 'Charity work', 'Volunteering'],
  ['Nature walks', 'Hiking', 'Environmental conservation'],
  ['Reading', 'Writing', 'Poetry'],
]

// ── Scoring helpers ─────────────────────────────────────────────────

/** Returns points (capped at max) when two text values match exactly. */
function exactMatch(a: string | null | undefined, b: string | null | undefined, pts: number): number {
  if (!a || !b) return 0
  return a.toLowerCase() === b.toLowerCase() ? pts : 0
}

/** Returns points when candidate value is in a preference array. */
function inArray(value: string | null | undefined, arr: string[] | null | undefined, pts: number): number {
  if (!value || !arr || arr.length === 0) return 0
  return arr.some(v => v.toLowerCase() === value.toLowerCase()) ? pts : 0
}

/** Returns points when candidate boolean matches preference string ("yes"/"no"). */
function boolPrefMatch(candidateVal: boolean | null | undefined, prefVal: string | null | undefined, pts: number): number {
  if (prefVal === null || prefVal === undefined || prefVal === '') return 0
  const expected = prefVal.toLowerCase() === 'yes'
  return candidateVal === expected ? pts : 0
}

// ── Core compatibility calculator ───────────────────────────────────

export function calculateCompatibility(
  currentUser: UserRow,
  candidate: UserRow,
  settings: Partial<SettingsRow> | null
): number {
  let score = 0

  // ── 1. Islamic Values (20 pts) ──────────────────────────────────
  score += exactMatch(currentUser.prayer_frequency, candidate.prayer_frequency, 5)
  score += exactMatch(currentUser.religiosity, candidate.religiosity, 5)
  score += exactMatch((currentUser as any).sect, (candidate as any).sect, 4)
  score += exactMatch((currentUser as any).halal_food, (candidate as any).halal_food, 3)
  score += exactMatch(currentUser.marriage_intention, candidate.marriage_intention, 3)

  // ── 2. Shared Interests (15 pts) ────────────────────────────────
  const userInterests = currentUser.interests ?? []
  const candInterests = candidate.interests ?? []
  const overlapCount = userInterests.filter(i => candInterests.includes(i)).length
  let interestScore = Math.min(overlapCount * 3, 12)

  // Cluster bonus: +1 per shared cluster (max 3)
  let clusterBonus = 0
  for (const cluster of HIGH_COMPATIBILITY_CLUSTERS) {
    const userInCluster = userInterests.some(i => cluster.includes(i))
    const candInCluster = candInterests.some(i => cluster.includes(i))
    if (userInCluster && candInCluster) clusterBonus++
  }
  interestScore += Math.min(clusterBonus, 3)
  score += Math.min(interestScore, 15)

  // ── 3. Personality Match (8 pts) ────────────────────────────────
  const userPersonality: string[] = (currentUser as any).personality ?? []
  const candPersonality: string[] = (candidate as any).personality ?? []
  const sharedTraits = userPersonality.filter(t => candPersonality.includes(t)).length
  score += Math.min(Math.round(sharedTraits * 2.5), 8)

  // ── 4. Age Proximity (8 pts) ────────────────────────────────────
  const ageGap = Math.abs((currentUser.age ?? 0) - (candidate.age ?? 0))
  if (ageGap <= 2) score += 8
  else if (ageGap <= 5) score += 6
  else if (ageGap <= 8) score += 4
  else if (ageGap <= 12) score += 2

  // ── 5. Location Proximity (8 pts) ───────────────────────────────
  if (currentUser.city && candidate.city && currentUser.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += 8
  } else if ((currentUser as any).state && (candidate as any).state && (currentUser as any).state.toLowerCase() === (candidate as any).state.toLowerCase()) {
    score += 6
  } else if (currentUser.country && candidate.country && currentUser.country.toLowerCase() === candidate.country.toLowerCase()) {
    score += 4
  } else {
    score += 2
  }

  // ── 6. Lifestyle Alignment (10 pts) ─────────────────────────────
  score += exactMatch(currentUser.smoking, candidate.smoking, 2)
  score += exactMatch(currentUser.alcohol, candidate.alcohol, 2)
  score += exactMatch((currentUser as any).psychedelics, (candidate as any).psychedelics, 2)
  score += exactMatch((currentUser as any).self_care_frequency, (candidate as any).self_care_frequency, 2)
  score += exactMatch((currentUser as any).self_care_budget, (candidate as any).self_care_budget, 1)
  score += exactMatch((currentUser as any).shopping_frequency, (candidate as any).shopping_frequency, 1)

  // ── 7. Finance & Travel (8 pts) ─────────────────────────────────
  score += exactMatch((currentUser as any).finance_style, (candidate as any).finance_style, 3)
  score += exactMatch((currentUser as any).travel_frequency, (candidate as any).travel_frequency, 3)
  score += exactMatch((currentUser as any).dining_frequency, (candidate as any).dining_frequency, 2)

  // ── 8. Education & Career (5 pts) ───────────────────────────────
  if (settings) {
    score += inArray(candidate.education, settings.preferred_education, 3)
    score += inArray(candidate.profession, (settings as any).occupation_preference, 2)
  }

  // ── 9. Family Values (8 pts) ────────────────────────────────────
  if (settings) {
    score += boolPrefMatch(candidate.has_children, (settings as any).has_children_preference, 2)
    score += boolPrefMatch(candidate.wants_children, (settings as any).want_children_preference, 2)
    score += boolPrefMatch((candidate as any).willing_to_relocate, (settings as any).willing_to_relocate, 2)
    score += inArray(candidate.marital_status, settings.preferred_marital_status, 1)
  }
  // Living arrangements similarity
  score += exactMatch((currentUser as any).living_arrangements, (candidate as any).living_arrangements, 1)

  // ── 10. Profile Quality (5 pts) ─────────────────────────────────
  if (candidate.profile_photo || ((candidate as any).profile_photos && (candidate as any).profile_photos.length > 0)) score += 1
  const photoCount = Array.isArray((candidate as any).profile_photos) ? (candidate as any).profile_photos.length : 0
  if (photoCount >= 3) score += 1
  if ((candidate as any).video_intro) score += 1
  if ((candidate.profile_rating ?? 0) > 70) score += 1
  if (((candidate as any).chat_rating ?? 0) > 70) score += 1

  // ── 11. Mutual Fit Bonus (5 pts) ────────────────────────────────
  // Check if the candidate's own age preferences include the current user
  // We need to load candidate's settings for this -- done via a join or subquery
  // For now, we use a simplified check based on age gap reasonableness
  if (ageGap <= 5) score += 5
  else if (ageGap <= 10) score += 3

  return Math.min(score, 100)
}

// ── Distance computation ────────────────────────────────────────────

function haversineDistanceMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Main service ────────────────────────────────────────────────────

export class MatchingService {

  /**
   * Fetch potential matches for the given authenticated user.
   * Applies hard filters at the DB level, then scores and sorts client-side.
   */
  static async getPotentialMatches(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<MatchProfile[]> {
    // 1. Load current user profile
    const { data: currentUser, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userErr || !currentUser) {
      console.error('Error loading current user for matching:', userErr)
      return []
    }

    // 2. Load current user's match preferences
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // 3. Determine opposite gender
    const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male'

    // 4. Build query with hard filters
    let query = supabase
      .from('users')
      .select('*')
      .eq('gender', oppositeGender)
      .eq('is_active', true)
      .neq('id', userId)

    // Age range filter
    const ageMin = settings?.age_range_min ?? 18
    const ageMax = settings?.age_range_max ?? 60
    query = query.gte('age', ageMin).lte('age', ageMax)

    // Minimum profile rating filter
    const minProfileRating = (settings as any)?.min_profile_rating ?? 0
    if (minProfileRating > 0) {
      query = query.gte('profile_rating', minProfileRating)
    }

    // Minimum chat rating filter
    const minChatRating = (settings as any)?.min_chat_rating ?? 0
    if (minChatRating > 0) {
      query = query.gte('chat_rating', minChatRating)
    }

    // Preferred marital status filter
    const prefMarital = settings?.preferred_marital_status
    if (prefMarital && prefMarital.length > 0) {
      query = query.in('marital_status', prefMarital)
    }

    // Preferred nationality filter
    const prefNationality = settings?.preferred_nationality
    if (prefNationality && prefNationality.length > 0) {
      query = query.in('nationality', prefNationality)
    }

    // Height minimum filter
    const heightMin = (settings as any)?.height_min
    if (heightMin && heightMin > 0) {
      query = query.gte('height', heightMin)
    }

    // Verified only filter
    if (settings?.show_only_verified) {
      query = query.eq('is_verified', true)
    }

    // Fetch a larger pool to filter/score (3x limit for good coverage)
    query = query.limit(limit * 3)

    const { data: candidates, error: candErr } = await query

    if (candErr) {
      console.error('Error fetching candidate profiles:', candErr)
      return []
    }

    if (!candidates || candidates.length === 0) return []

    // 5. Client-side geofencing (PostGIS ST_DWithin can't be used via query builder directly)
    const anywhereInWorld = settings?.anywhere_in_world ?? false
    const maxDistanceMiles = settings?.max_distance ?? 50
    const userLat = currentUser.latitude
    const userLon = currentUser.longitude

    let filtered = candidates
    if (!anywhereInWorld && userLat && userLon) {
      filtered = candidates.filter(c => {
        if (!c.latitude || !c.longitude) return true // Include users without location data
        const dist = haversineDistanceMiles(userLat, userLon, c.latitude, c.longitude)
        return dist <= maxDistanceMiles
      })
    }

    // 6. Score each candidate
    const scored: MatchProfile[] = filtered.map(c => {
      const compatScore = calculateCompatibility(currentUser, c, settings)

      // Compute distance
      let distMiles: number | null = null
      if (userLat && userLon && c.latitude && c.longitude) {
        distMiles = Math.round(haversineDistanceMiles(userLat, userLon, c.latitude, c.longitude))
      }

      const fullName = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.full_name || 'Unknown'

      return {
        id: c.id,
        name: fullName,
        age: c.age ?? 0,
        gender: c.gender ?? oppositeGender,
        bio: c.bio ?? '',
        location: c.location ?? '',
        city: c.city ?? null,
        state: (c as any).state ?? null,
        country: c.country ?? null,
        nationality: (c as any).nationality ?? null,
        latitude: c.latitude ?? null,
        longitude: c.longitude ?? null,

        profile_photo: c.profile_photo ?? null,
        profile_photos: Array.isArray((c as any).profile_photos) ? (c as any).profile_photos : null,
        additional_photos: (c as any).additional_photos ?? null,
        video_intro: (c as any).video_intro ?? null,
        voice_intro: (c as any).voice_intro ?? null,

        profile_rating: c.profile_rating ?? 0,
        chat_rating: (c as any).chat_rating ?? 0,
        response_rate: c.response_rate ?? 0,
        communication_rating: c.communication_rating ?? 0,
        is_verified: c.is_verified ?? false,

        religiosity: c.religiosity ?? null,
        prayer_frequency: c.prayer_frequency ?? null,
        hijab_preference: c.hijab_preference ?? null,
        marriage_intention: c.marriage_intention ?? null,
        sect: (c as any).sect ?? null,
        islamic_values: (c as any).islamic_values ?? null,
        is_revert: c.is_revert ?? false,
        halal_food: (c as any).halal_food ?? null,

        alcohol: c.alcohol ?? null,
        smoking: c.smoking ?? null,
        psychedelics: (c as any).psychedelics ?? null,
        self_care_frequency: (c as any).self_care_frequency ?? null,
        self_care_budget: (c as any).self_care_budget ?? null,
        shopping_frequency: (c as any).shopping_frequency ?? null,
        finance_style: (c as any).finance_style ?? null,
        dining_frequency: (c as any).dining_frequency ?? null,
        travel_frequency: (c as any).travel_frequency ?? null,

        education: c.education ?? null,
        profession: c.profession ?? null,

        marital_status: c.marital_status ?? null,
        has_children: c.has_children ?? false,
        wants_children: c.wants_children ?? false,
        willing_to_relocate: (c as any).willing_to_relocate ?? false,
        living_arrangements: (c as any).living_arrangements ?? null,

        interests: c.interests ?? [],
        personality: (c as any).personality ?? [],
        height: (c as any).height ?? null,

        compatibility_score: compatScore,
        distance_miles: distMiles,
      }
    })

    // 7. Sort by compatibility score descending
    scored.sort((a, b) => b.compatibility_score - a.compatibility_score)

    // 8. Apply pagination
    return scored.slice(offset, offset + limit)
  }

  // ── Interaction tracking ────────────────────────────────────────

  static async recordMessage(
    fromUserId: string,
    toUserId: string,
    messageType: 'audio' | 'video' | 'text',
    messageContent?: string,
    messageUrl?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('match_interactions')
        .insert({
          from_user: fromUserId,
          to_user: toUserId,
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

  static async recordProfileView(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('match_interactions')
        .insert({
          from_user: fromUserId,
          to_user: toUserId,
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

  /**
   * Get users who sent messages to the current user.
   */
  static async getUsersWhoMessagedMe(userId: string): Promise<MatchProfile[]> {
    try {
      const { data: interactions, error } = await supabase
        .from('match_interactions')
        .select('from_user')
        .eq('to_user', userId)
        .eq('type', 'message')

      if (error || !interactions || interactions.length === 0) return []

      const senderIds = [...new Set(interactions.map(i => i.from_user))]
      
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .in('id', senderIds)
        .eq('is_active', true)

      if (usersErr || !users) return []

      return users.map(c => mapUserToMatchProfile(c, null))
    } catch (error) {
      console.error('Error in getUsersWhoMessagedMe:', error)
      return []
    }
  }

  /**
   * Get users the current user has messaged.
   */
  static async getUsersIMessaged(userId: string): Promise<MatchProfile[]> {
    try {
      const { data: interactions, error } = await supabase
        .from('match_interactions')
        .select('to_user')
        .eq('from_user', userId)
        .eq('type', 'message')

      if (error || !interactions || interactions.length === 0) return []

      const recipientIds = [...new Set(interactions.map(i => i.to_user))]
      
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .in('id', recipientIds)
        .eq('is_active', true)

      if (usersErr || !users) return []

      return users.map(c => mapUserToMatchProfile(c, null))
    } catch (error) {
      console.error('Error in getUsersIMessaged:', error)
      return []
    }
  }
}

// ── Helper to map a raw user row to MatchProfile ────────────────────

function mapUserToMatchProfile(c: any, distMiles: number | null): MatchProfile {
  const fullName = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.full_name || 'Unknown'

  return {
    id: c.id,
    name: fullName,
    age: c.age ?? 0,
    gender: c.gender ?? '',
    bio: c.bio ?? '',
    location: c.location ?? '',
    city: c.city ?? null,
    state: c.state ?? null,
    country: c.country ?? null,
    nationality: c.nationality ?? null,
    latitude: c.latitude ?? null,
    longitude: c.longitude ?? null,

    profile_photo: c.profile_photo ?? null,
    profile_photos: Array.isArray(c.profile_photos) ? c.profile_photos : null,
    additional_photos: c.additional_photos ?? null,
    video_intro: c.video_intro ?? null,
    voice_intro: c.voice_intro ?? null,

    profile_rating: c.profile_rating ?? 0,
    chat_rating: c.chat_rating ?? 0,
    response_rate: c.response_rate ?? 0,
    communication_rating: c.communication_rating ?? 0,
    is_verified: c.is_verified ?? false,

    religiosity: c.religiosity ?? null,
    prayer_frequency: c.prayer_frequency ?? null,
    hijab_preference: c.hijab_preference ?? null,
    marriage_intention: c.marriage_intention ?? null,
    sect: c.sect ?? null,
    islamic_values: c.islamic_values ?? null,
    is_revert: c.is_revert ?? false,
    halal_food: c.halal_food ?? null,

    alcohol: c.alcohol ?? null,
    smoking: c.smoking ?? null,
    psychedelics: c.psychedelics ?? null,
    self_care_frequency: c.self_care_frequency ?? null,
    self_care_budget: c.self_care_budget ?? null,
    shopping_frequency: c.shopping_frequency ?? null,
    finance_style: c.finance_style ?? null,
    dining_frequency: c.dining_frequency ?? null,
    travel_frequency: c.travel_frequency ?? null,

    education: c.education ?? null,
    profession: c.profession ?? null,

    marital_status: c.marital_status ?? null,
    has_children: c.has_children ?? false,
    wants_children: c.wants_children ?? false,
    willing_to_relocate: c.willing_to_relocate ?? false,
    living_arrangements: c.living_arrangements ?? null,

    interests: c.interests ?? [],
    personality: c.personality ?? [],
    height: c.height ?? null,

    compatibility_score: 0,
    distance_miles: distMiles,
  }
}
