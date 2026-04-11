'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useUser } from '@/app/context/UserContext'
import { CelestialBackground } from '@/components/ui/celestial-background'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const { signIn } = useAuth()
  const { userId, isAuthenticated, profile, loading: profileLoading } = useUser()
  const router = useRouter()

  const handleResendVerification = async () => {
    if (!email) return
    setResending(true)
    setResendSuccess(false)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok && !data.alreadyVerified) {
        setResendSuccess(true)
      } else if (data.alreadyVerified) {
        setError('Your email is already verified. Please try logging in again.')
        setNeedsVerification(false)
      }
    } catch (err: any) {
      setError('Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setResendSuccess(false)
    setIsLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        // Check for email not verified error
        if (signInError.message.toLowerCase().includes('email not verified') || 
            signInError.message.toLowerCase().includes('not confirmed') ||
            signInError.code === 'email_not_confirmed') {
          setNeedsVerification(true)
          setError('Please verify your email address before signing in.')
        } else {
          setError(signInError.message)
        }
      } else {
        // Login successful - check if profile is complete
        console.log('[Login] Sign in successful, checking profile completion...')
        
        // Get the user ID from the auth session directly
        const { data: { session } } = await import('@/lib/supabase').then(mod => mod.supabase.auth.getSession())
        
        if (!session?.user?.id) {
          console.error('[Login] No session found after sign in')
          router.push('/')
          return
        }
        
        const currentUserId = session.user.id
        console.log('[Login] User ID from session:', currentUserId)
        
        // Wait a moment for the user context to update
        setTimeout(async () => {
          try {
            // Import ProfileService dynamically
            const { ProfileService } = await import('@/lib/database')
            
            // Get user profile using the session user ID
            const userProfile = await ProfileService.getProfileByUserId(currentUserId)
            
            if (!userProfile) {
              console.log('[Login] No profile found, redirecting to profile setup')
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

            console.log('[Login] Profile completion:', {
              filledFields,
              totalFields: requiredFields.length,
              percentage: completionPercentage.toFixed(0) + '%'
            })

            // If less than 50% complete, redirect to profile setup
            if (completionPercentage < 50) {
              console.log('[Login] Profile incomplete (< 50%), redirecting to profile setup')
              router.push('/profile/setup')
            } else {
              console.log('[Login] Profile complete, redirecting to home')
              router.push('/')
            }
          } catch (error) {
            console.error('[Login] Error checking profile:', error)
            // If there's an error, just redirect to home
            router.push('/')
          }
        }, 500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 px-8 py-8 text-center">
              <h1 className="text-3xl font-bold text-white font-display">Welcome Back</h1>
              <p className="text-pink-100 mt-2 font-queensides">Sign in to your Samaa account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-red-700 text-sm">{error}</p>
                    {needsVerification && (
                      <div className="mt-3">
                        {resendSuccess ? (
                          <p className="text-emerald-600 text-sm">Verification email sent! Please check your inbox.</p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resending}
                            className="text-pink-600 hover:text-pink-700 font-semibold text-sm underline disabled:opacity-50"
                          >
                            {resending ? 'Sending...' : 'Resend verification email'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-queensides">Email</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-queensides">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-pink-600 hover:text-pink-700 font-queensides"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.button>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-pink-100">
                <p className="text-gray-600 font-queensides">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-pink-600 hover:text-pink-700 font-semibold">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Arabic-inspired corner decorations */}
          <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-xl"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-rose-400/60 rounded-tr-xl"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-rose-400/60 rounded-bl-xl"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-xl"></div>
        </motion.div>
      </div>
    </div>
  )
}
