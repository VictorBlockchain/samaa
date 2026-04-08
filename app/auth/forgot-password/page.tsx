'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { CelestialBackground } from '@/components/ui/celestial-background'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Check Your Email</h2>
            <p className="text-gray-600 font-queensides mb-6">
              If an account with that email exists, we've sent a password reset link. Please check your inbox.
            </p>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Back to Sign In
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-white font-display">Reset Password</h1>
              <p className="text-pink-100 mt-2 font-queensides">Enter your email to receive a reset link</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 text-sm"
                >
                  {error}
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
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.button>

              {/* Back to Login Link */}
              <div className="text-center pt-4 border-t border-pink-100">
                <Link href="/auth/login" className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 font-queensides">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
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
