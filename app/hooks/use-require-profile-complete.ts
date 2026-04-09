import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'
import { ProfileService } from '@/lib/database'

/**
 * Hook to check if user has completed their profile
 * Redirects to /profile/setup if profile is incomplete
 */
export function useRequireProfileComplete() {
  const router = useRouter()
  const { userId, isAuthenticated, profile, loading } = useUser()

  useEffect(() => {
    // Only check if authenticated and not loading
    if (!isAuthenticated || loading) return

    const checkProfileComplete = async () => {
      try {
        // Get fresh profile data
        const userProfile = profile || await ProfileService.getProfileByUserId(userId!)
        
        if (!userProfile) {
          // No profile at all, redirect to setup
          console.log('[Profile Check] No profile found, redirecting to setup')
          router.push('/profile/setup')
          return
        }

        // Check if essential fields are filled
        const requiredFields = [
          userProfile.first_name,
          userProfile.last_name,
          userProfile.age,
          userProfile.gender,
          userProfile.location,
          userProfile.education,
          userProfile.profession,
          userProfile.religiosity,
          userProfile.prayer_frequency,
          userProfile.marriage_intention,
          userProfile.bio,
        ]

        // Count how many required fields are filled
        const filledFields = requiredFields.filter(field => field !== null && field !== undefined && field !== '').length
        const completionPercentage = (filledFields / requiredFields.length) * 100

        console.log('[Profile Check] Profile completion:', {
          filledFields,
          totalFields: requiredFields.length,
          percentage: completionPercentage.toFixed(0) + '%'
        })

        // If less than 50% complete, redirect to profile setup
        if (completionPercentage < 50) {
          console.log('[Profile Check] Profile incomplete (< 50%), redirecting to setup')
          router.push('/profile/setup')
        }
      } catch (error) {
        console.error('[Profile Check] Error checking profile:', error)
      }
    }

    checkProfileComplete()
  }, [isAuthenticated, loading, userId, profile, router])

  return {
    isLoading: loading,
  }
}
