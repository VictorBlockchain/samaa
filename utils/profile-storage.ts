// Profile storage utility with Supabase integration
// Falls back to mock data for development/testing

interface ProfileData {
  // Basic Info
  firstName: string
  lastName: string
  age: string
  gender: string
  height?: string
  maritalStatus: string
  children?: string
  tagline?: string
  bio: string
  location?: string
  bioTagline?: string
  wantChildren?: string
  hasChildren?: string

  // Location
  currentLocation: string
  grewUpIn: string
  livingArrangements: string

  // Education & Career
  education: string
  profession: string
  employer: string
  jobTitle: string

  // Languages & Ethnicity
  ethnicity: string
  nationality: string
  languages: string[]

  // Islamic Values & Religiosity
  sect?: string
  bornMuslim?: string
  religiousPractice?: string
  faith?: string
  diet?: string
  alcohol: string
  smoking: string
  psychedelics?: string
  halalFood?: string
  isRevert?: string
  hijabChoice?: string
  islamicValues?: string
  prayerFrequency?: string
  quranReading?: string
  islamicEducation?: string
  religiosity?: string
  hijabPreference?: string
  marriageIntention?: string

  // Marriage Intentions
  chattingTimeline?: string
  familyInvolvement?: string
  marriageTimeline?: string
  lookingFor?: string
  familyPlans?: string

  // Future Plans
  relocationPlans?: string
  polygamyPlan?: string

  // Interests & Personality
  interests: string[]
  personality?: string[]

  // Wallet Information
  dowryWallet?: {
    isSetup: boolean
    address?: string
    solanaBalance?: number
    samaaBalance?: number
  }
  purseWallet?: {
    isSetup: boolean
    address?: string
    solanaBalance?: number
    samaaBalance?: number
  }

  // Media from profile setup
  media?: {
    photos: string[]
    videoIntro?: string
    voiceNote?: string
    audioMessages?: string[]
  }
  profilePhoto?: File | null | string
  voiceIntro?: string
  video?: string
  photos?: string[]

  // Verification & Premium
  walletAddress: string
  createdAt: string
  updatedAt?: string
  isVerified?: boolean
  premiumMember?: boolean
  idVerified?: boolean
  bioRating?: number
  responseRate?: number
  profileComplete?: boolean
  latitude?: number
  longitude?: number
}

// Mock profiles data - in production this would be fetched from API
const MOCK_PROFILES: { [walletAddress: string]: ProfileData } = {
  "BPaN7WF2c5dxBr7NQWrqb1aY3TwQAjfMVmvDZZZ8L12z": {
    firstName: "Ahmed",
    lastName: "Hassan",
    age: "29",
    gender: "male",
    height: "5'10\"",
    maritalStatus: "never_married",
    children: "0",
    tagline: "Seeking a righteous partner for this life and the next",
    bio: "Assalamu alaikum! I'm Ahmed, a software engineer living in New York. I was born in Cairo but moved to the US for my studies and career. I'm looking for a practicing Muslim sister who shares my values and vision for building a strong Islamic family together.\n\nI pray five times a day, attend Jummah regularly, and try to live my life according to Islamic principles. I enjoy reading Islamic books, playing soccer, and exploring new technologies. I'm also passionate about giving back to the community through volunteer work at the local mosque.\n\nI'm looking for someone who is kind, practicing, and ready to start a family. If you think we might be compatible, I'd love to hear from you insha'Allah.",
    location: "New York, NY, USA",
    bioTagline: "Seeking a righteous partner for this life and the next",
    wantChildren: "yes",
    hasChildren: "no",
    currentLocation: "New York, NY, USA",
    grewUpIn: "Cairo, Egypt",
    livingArrangements: "alone",
    education: "bachelors",
    profession: "Software Engineer",
    employer: "Tech Solutions Inc",
    jobTitle: "Senior Developer",
    ethnicity: "Arab",
    nationality: "Egyptian-American",
    languages: ["Arabic", "English"],
    sect: "Sunni",
    bornMuslim: "yes",
    religiousPractice: "very_religious",
    faith: "strong",
    diet: "halal_only",
    alcohol: "never",
    smoking: "never",
    psychedelics: "never",
    halalFood: "always",
    isRevert: "no",
    hijabChoice: "not_applicable",
    islamicValues: "traditional",
    prayerFrequency: "five_times_daily",
    quranReading: "daily",
    islamicEducation: "self_taught",
    religiosity: "very_religious",
    hijabPreference: "not_applicable",
    marriageIntention: "within_year",
    chattingTimeline: "few_weeks",
    familyInvolvement: "involved",
    marriageTimeline: "within_year",
    lookingFor: "practicing_muslim",
    familyPlans: "children_soon",
    relocationPlans: "open_to_relocate",
    polygamyPlan: "not_interested",
    interests: ["Technology", "Soccer", "Islamic Studies", "Volunteer Work", "Reading", "Travel"],
    personality: ["Kind", "Ambitious", "Religious", "Family-oriented"],
    dowryWallet: {
      isSetup: false,
      address: undefined,
      solanaBalance: 0,
      samaaBalance: 0
    },
    purseWallet: {
      isSetup: false,
      address: undefined,
      solanaBalance: 0,
      samaaBalance: 0
    },
    media: {
      photos: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face"
      ],
      videoIntro: undefined,
      voiceNote: undefined,
      audioMessages: []
    },
    profilePhoto: null,
    voiceIntro: undefined,
    video: undefined,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face"
    ],
    walletAddress: "BPaN7WF2c5dxBr7NQWrqb1aY3TwQAjfMVmvDZZZ8L12z",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    isVerified: true,
    premiumMember: false,
    idVerified: true,
    bioRating: 92,
    responseRate: 85,
    profileComplete: true,
    latitude: 40.7128,
    longitude: -74.0060
  }
}

export async function loadProfile(walletAddress: string): Promise<ProfileData | null> {
  try {
    // First try to load from Supabase
    try {
      const { ProfileService } = await import('@/lib/database')
      const supabaseProfile = await ProfileService.getProfileByAddress(walletAddress)

      if (supabaseProfile) {
        console.log("Loading profile from Supabase for:", walletAddress)
        // Convert Supabase profile to ProfileData format
        return convertSupabaseToProfileData(supabaseProfile)
      }
    } catch (supabaseError) {
      console.log("Supabase not available, falling back to mock/local data:", supabaseError)
    }

    // Fallback to mock profiles
    if (MOCK_PROFILES[walletAddress]) {
      console.log("Loading profile from mock data for:", walletAddress)
      return MOCK_PROFILES[walletAddress]
    }

    // Final fallback to localStorage for user's own profile or other locally created profiles
    const savedProfile = localStorage.getItem(`profile_${walletAddress}`)
    if (savedProfile) {
      console.log("Loading profile from localStorage for:", walletAddress)
      return JSON.parse(savedProfile)
    }

    console.log("No profile found for:", walletAddress)
    return null
  } catch (error) {
    console.error("Error loading profile:", error)
    return null
  }
}

// Helper function to convert Supabase user data to ProfileData format
function convertSupabaseToProfileData(user: any): ProfileData {
  return {
    firstName: user.first_name,
    lastName: user.last_name,
    age: user.age?.toString() || '',
    gender: user.gender,
    height: user.height || '',
    maritalStatus: user.marital_status || '',
    children: user.has_children ? 'yes' : 'no',
    tagline: user.bio?.substring(0, 100) || '',
    bio: user.bio || '',
    location: user.location,
    bioTagline: user.bio?.substring(0, 100) || '',
    wantChildren: user.wants_children ? 'yes' : 'no',
    hasChildren: user.has_children ? 'yes' : 'no',
    currentLocation: user.location,
    grewUpIn: user.city || user.location,
    livingArrangements: 'unknown',
    education: user.education || '',
    profession: user.profession || '',
    employer: user.employer || '',
    jobTitle: user.job_title || '',
    ethnicity: user.ethnicity || '',
    nationality: user.nationality || '',
    languages: user.languages || [],
    sect: 'Sunni',
    bornMuslim: 'yes',
    religiousPractice: user.religiosity || '',
    faith: 'strong',
    diet: 'halal_only',
    alcohol: 'never',
    smoking: 'never',
    psychedelics: 'never',
    halalFood: 'always',
    isRevert: 'no',
    hijabChoice: user.hijab_preference || '',
    islamicValues: 'traditional',
    prayerFrequency: user.prayer_frequency || '',
    quranReading: 'daily',
    islamicEducation: 'self_taught',
    religiosity: user.religiosity || '',
    hijabPreference: user.hijab_preference || '',
    marriageIntention: user.marriage_intention || '',
    chattingTimeline: 'few_weeks',
    familyInvolvement: 'involved',
    marriageTimeline: user.marriage_intention || '',
    lookingFor: 'practicing_muslim',
    familyPlans: 'children_soon',
    relocationPlans: 'open_to_relocate',
    polygamyPlan: 'not_interested',
    interests: user.interests || [],
    personality: ['Kind', 'Religious'],
    dowryWallet: {
      isSetup: !!user.dowry_wallet_address,
      address: user.dowry_wallet_address,
      solanaBalance: 0,
      samaaBalance: 0
    },
    purseWallet: {
      isSetup: !!user.purse_wallet_address,
      address: user.purse_wallet_address,
      solanaBalance: 0,
      samaaBalance: 0
    },
    media: {
      photos: user.profile_photos || [],
      videoIntro: user.video_intro,
      voiceNote: user.voice_intro,
      audioMessages: []
    },
    profilePhoto: user.profile_photo,
    voiceIntro: user.voice_intro,
    video: user.video_intro,
    photos: user.profile_photos || [],
    walletAddress: user.solana_address,
    createdAt: user.created_at || new Date().toISOString(),
    updatedAt: user.updated_at || new Date().toISOString(),
    isVerified: user.is_verified || false,
    premiumMember: false,
    idVerified: user.is_verified || false,
    bioRating: user.bio_rating || 0,
    responseRate: user.response_rate || 0,
    profileComplete: true,
    latitude: user.latitude,
    longitude: user.longitude
  }
}

export async function saveProfile(walletAddress: string, profileData: Partial<ProfileData>): Promise<boolean> {
  try {
    // First try to save to Supabase
    try {
      const { ProfileService } = await import('@/lib/database')

      // Convert ProfileData to Supabase format
      const supabaseData = convertProfileDataToSupabase(walletAddress, profileData)

      const savedProfile = await ProfileService.upsertProfile(supabaseData)
      if (savedProfile) {
        console.log("Profile saved to Supabase successfully for:", walletAddress)

        // Also save to localStorage as backup
        const existingProfile = await loadProfile(walletAddress)
        const updatedProfile = {
          ...existingProfile,
          ...profileData,
          walletAddress,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(updatedProfile))

        return true
      }
    } catch (supabaseError) {
      console.log("Supabase save failed, falling back to localStorage:", supabaseError)
    }

    // Fallback to localStorage only
    const existingProfile = await loadProfile(walletAddress)
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      walletAddress,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(updatedProfile))

    // Also save to allProfiles for matching
    const existingProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]')
    const updatedProfiles = existingProfiles.filter((p: any) => p.walletAddress !== walletAddress)
    updatedProfiles.push(updatedProfile)
    localStorage.setItem('allProfiles', JSON.stringify(updatedProfiles))

    console.log("Profile saved to localStorage successfully for:", walletAddress)
    return true
  } catch (error) {
    console.error("Error saving profile:", error)
    return false
  }
}

// Helper function to convert ProfileData to Supabase format
function convertProfileDataToSupabase(walletAddress: string, profileData: Partial<ProfileData>): any {
  return {
    solana_address: walletAddress,
    first_name: profileData.firstName || '',
    last_name: profileData.lastName || '',
    age: profileData.age ? parseInt(profileData.age) : 18,
    gender: profileData.gender as 'male' | 'female',
    date_of_birth: calculateDateOfBirth(profileData.age),
    location: profileData.currentLocation || profileData.location || '',
    latitude: profileData.latitude,
    longitude: profileData.longitude,
    city: profileData.currentLocation?.split(',')[0]?.trim(),
    country: 'US', // Default for now
    education: mapEducationLevel(profileData.education),
    profession: profileData.profession,
    employer: profileData.employer,
    job_title: profileData.jobTitle,
    ethnicity: profileData.ethnicity,
    nationality: profileData.nationality,
    languages: profileData.languages,
    religiosity: mapReligiosity(profileData.religiosity),
    prayer_frequency: mapPrayerFrequency(profileData.prayerFrequency),
    hijab_preference: mapHijabPreference(profileData.hijabPreference),
    marriage_intention: mapMarriageIntention(profileData.marriageIntention),
    marital_status: mapMaritalStatus(profileData.maritalStatus),
    has_children: profileData.hasChildren === 'yes' || profileData.children === 'yes',
    wants_children: profileData.wantChildren === 'yes',
    bio: profileData.bio,
    interests: profileData.interests,
    profile_photo: typeof profileData.profilePhoto === 'string' ? profileData.profilePhoto : null,
    profile_photos: profileData.photos || profileData.media?.photos,
    voice_intro: profileData.voiceIntro || profileData.media?.voiceNote,
    video_intro: profileData.video || profileData.media?.videoIntro,
    dowry_wallet_address: profileData.dowryWallet?.address,
    purse_wallet_address: profileData.purseWallet?.address,
    bio_rating: profileData.bioRating,
    response_rate: profileData.responseRate,
    is_verified: profileData.isVerified || false,
    is_active: true,
    last_active: new Date().toISOString()
  }
}

// Helper functions for mapping enum values
function calculateDateOfBirth(age?: string): string {
  if (!age) return new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const ageNum = parseInt(age)
  return new Date(Date.now() - ageNum * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

function mapEducationLevel(education?: string): any {
  const mapping: { [key: string]: any } = {
    'high_school': 'high_school',
    'bachelors': 'bachelors',
    'masters': 'masters',
    'phd': 'phd',
    'trade_school': 'trade_school'
  }
  return mapping[education || ''] || 'other'
}

function mapReligiosity(religiosity?: string): any {
  const mapping: { [key: string]: any } = {
    'very_religious': 'very_religious',
    'religious': 'religious',
    'moderate': 'moderate',
    'learning': 'learning'
  }
  return mapping[religiosity || ''] || 'moderate'
}

function mapPrayerFrequency(frequency?: string): any {
  const mapping: { [key: string]: any } = {
    'five_times_daily': 'five_times_daily',
    'regularly': 'regularly',
    'sometimes': 'sometimes',
    'learning': 'learning'
  }
  return mapping[frequency || ''] || 'regularly'
}

function mapHijabPreference(preference?: string): any {
  const mapping: { [key: string]: any } = {
    'always': 'always',
    'sometimes': 'sometimes',
    'planning': 'planning',
    'no': 'no'
  }
  return mapping[preference || ''] || 'no'
}

function mapMarriageIntention(intention?: string): any {
  const mapping: { [key: string]: any } = {
    'soon': 'soon',
    'within_year': 'within_year',
    'future': 'future'
  }
  return mapping[intention || ''] || 'future'
}

function mapMaritalStatus(status?: string): any {
  const mapping: { [key: string]: any } = {
    'never_married': 'never_married',
    'divorced': 'divorced',
    'widowed': 'widowed'
  }
  return mapping[status || ''] || 'never_married'
}

export async function getAllProfiles(): Promise<ProfileData[]> {
  try {
    // Combine mock profiles with localStorage profiles
    const mockProfilesList = Object.values(MOCK_PROFILES)
    const localProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]')
    
    // Filter out duplicates (localStorage profiles override mock profiles)
    const localWalletAddresses = localProfiles.map((p: ProfileData) => p.walletAddress)
    const filteredMockProfiles = mockProfilesList.filter(p => !localWalletAddresses.includes(p.walletAddress))
    
    return [...filteredMockProfiles, ...localProfiles]
  } catch (error) {
    console.error("Error loading all profiles:", error)
    return []
  }
}

export function isProfileComplete(profile: ProfileData | null): boolean {
  if (!profile) return false

  const requiredFields = [
    "firstName",
    "lastName", 
    "age",
    "gender",
    "currentLocation",
    "education",
    "profession",
    "religiosity",
    "prayerFrequency",
    "marriageIntention",
    "bio",
  ]

  return requiredFields.every((field) => profile[field as keyof ProfileData])
}
