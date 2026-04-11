'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle, AlertCircle } from 'lucide-react'
import { CelestialBackground } from '@/components/ui/celestial-background'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!acceptTerms) {
      setError('Please accept the user agreement to continue')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          age: age ? parseInt(age) : null,
          gender: gender || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
      } else {
        setRegisteredEmail(email)
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
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
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">Account Created!</h2>
            <p className="text-gray-600 font-queensides mb-4">
              We've sent a verification email to <strong>{registeredEmail}</strong>. Please check your inbox and click the verification link to activate your account.
            </p>
            <p className="text-slate-500 text-sm font-queensides mb-6">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/auth/verify-email" className="text-pink-600 hover:text-pink-700 font-semibold">
                request a new one
              </Link>
            </p>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Sign In
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative mt-10">
      <CelestialBackground />
      <div className="relative z-10 min-h-screen py-6 md:py-20 pb-32 md:pb-36 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Card */}
          <div className="glass-card rounded-3xl shadow-2xl border border-pink-100/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 px-8 py-8 text-center">
              <h1 className="text-3xl font-bold text-white font-display">Join Samaa</h1>
              <p className="text-pink-100 mt-2 font-queensides">Create your account to get started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-queensides">First Name</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ahmed"
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-queensides">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Hassan"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                  />
                </div>
              </div>

              {/* Age and Gender Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-queensides">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    min="18"
                    max="120"
                    className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-queensides">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

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
                {/* Password Requirements */}
                {password && (
                  <div className="space-y-1 mt-2">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className={`w-3 h-3 rounded-full ${req.met ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        <span className={req.met ? 'text-emerald-600' : 'text-gray-400'}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-queensides">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-queensides"
                  />
                </div>
              </div>

              {/* User Agreement Checkbox */}
              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-pink-300 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-pink-400 peer-checked:to-rose-500 peer-checked:border-pink-500 transition-all duration-300 flex items-center justify-center group-hover:border-pink-400">
                      {acceptTerms && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 font-queensides leading-relaxed">
                    I accept the{' '}
                    <Link href="/terms" className="text-pink-600 hover:text-pink-700 font-semibold underline decoration-pink-300 hover:decoration-pink-500 transition-colors">
                      User Agreement
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-pink-600 hover:text-pink-700 font-semibold underline decoration-pink-300 hover:decoration-pink-500 transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
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
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.button>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-pink-100">
                <p className="text-gray-600 font-queensides">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-pink-600 hover:text-pink-700 font-semibold">
                    Sign in
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
