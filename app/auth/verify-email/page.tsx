'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { CelestialBackground } from '@/components/ui/celestial-background'

type VerificationStatus = 'loading' | 'success' | 'error' | 'already-verified'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setError('Invalid verification link. Please check your email for the correct link.')
      return
    }

    verifyEmail()
  }, [token, email])

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setError(data.error || 'Failed to verify email')
        return
      }

      if (data.alreadyVerified) {
        setStatus('already-verified')
      } else {
        setStatus('success')
      }
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'An unexpected error occurred')
    }
  }

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

      if (response.ok) {
        setResendSuccess(true)
      } else {
        setError(data.error || 'Failed to resend verification email')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Verifying Email</h2>
            <p className="text-gray-600 font-queensides">
              Please wait while we verify your email address...
            </p>
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Email Verified!</h2>
            <p className="text-gray-600 font-queensides mb-6">
              Your email has been verified successfully. You can now complete your profile and start your journey.
            </p>
            <motion.button
              onClick={() => router.push('/profile/setup')}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Complete Your Profile
            </motion.button>
          </motion.div>
        )

      case 'already-verified':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Already Verified</h2>
            <p className="text-gray-600 font-queensides mb-6">
              Your email has already been verified. You can log in to your account.
            </p>
            <motion.button
              onClick={() => router.push('/auth/login')}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In
            </motion.button>
          </motion.div>
        )

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Verification Failed</h2>
            <p className="text-gray-600 font-queensides mb-4">
              {error || 'We could not verify your email. The link may have expired.'}
            </p>
            
            {email && (
              <>
                {resendSuccess ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-700 text-sm mb-4"
                  >
                    A new verification email has been sent. Please check your inbox.
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={handleResendVerification}
                    disabled={resending}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full overflow-hidden bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-600 font-semibold py-3 rounded-2xl border border-pink-200 transition-all duration-300 disabled:opacity-60 mb-4 flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Resend Verification Email
                      </>
                    )}
                  </motion.button>
                )}
              </>
            )}
            
            <div className="text-center pt-4 border-t border-pink-100">
              <p className="text-gray-600 font-queensides">
                Need help?{' '}
                <Link href="/support" className="text-pink-600 hover:text-pink-700 font-semibold">
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md flex justify-center">
          {/* Arabic-inspired corner decorations */}
          <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-xl"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-rose-400/60 rounded-tr-xl"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-rose-400/60 rounded-bl-xl"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-xl"></div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Loading...</h2>
          <p className="text-gray-600 font-queensides">
            Please wait while we load the page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
