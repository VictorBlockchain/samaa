"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Heart,
  Star,
  Settings,
  Bell,
  User,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
  HeartHandshake,
  MapPin,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UIKitPage() {
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center"
            >
              <HeartHandshake className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text font-display">Raha UI Kit</h1>
          </div>
          <p className="text-gray-600 text-lg font-light">
            رَاحَة - A comprehensive design system for Islamic dating applications
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent rounded-full mx-auto mt-8 max-w-md" />
        </motion.div>

        {/* Buttons Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Card className="modern-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Raha Brand Primary Buttons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Raha Brand Primary Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-8 py-4 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-white/20"
                  >
                    {/* Background shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 300] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />

                    {/* Islamic pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                        <pattern
                          id="islamic-dots-primary"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="10" cy="10" r="1" fill="currentColor" />
                          <path d="M5 10 L10 5 L15 10 L10 15 Z" fill="currentColor" opacity="0.3" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#islamic-dots-primary)" />
                      </svg>
                    </div>

                    {/* Button content */}
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <Heart className="w-5 h-5" />
                      <span className="font-display tracking-wide">Connect Hearts</span>
                    </div>

                    {/* Bottom glow effect */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-pink-400/30 rounded-full blur-lg group-hover:bg-pink-400/50 transition-all duration-300" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/20"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-80, 200] }}
                      transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                    <div className="relative z-10 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>Premium</span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Raha Brand Secondary Buttons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Raha Brand Secondary Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 hover:from-pink-200 hover:via-rose-200 hover:to-pink-200 text-pink-600 hover:text-pink-700 font-medium px-6 py-3 rounded-2xl border border-pink-200/60 hover:border-pink-300 transition-all duration-300 group flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {/* Islamic pattern overlay */}
                    <div className="absolute inset-0 opacity-5">
                      <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                        <pattern
                          id="islamic-pattern-secondary"
                          x="0"
                          y="0"
                          width="8"
                          height="8"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="4" cy="4" r="0.5" fill="currentColor" />
                          <path d="M2 4 L4 2 L6 4 L4 6 Z" fill="currentColor" opacity="0.3" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#islamic-pattern-secondary)" />
                      </svg>
                    </div>

                    <Settings className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Settings</span>

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                      animate={{ x: [-60, 120] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-pink-300/20 rounded-full blur-sm group-hover:bg-pink-300/40 transition-all duration-300" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:via-teal-100 hover:to-emerald-100 text-emerald-600 hover:text-emerald-700 font-medium px-5 py-2.5 rounded-2xl border border-emerald-200/60 hover:border-emerald-300 transition-all duration-300 group flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <div className="absolute inset-0 opacity-5">
                      <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                        <pattern
                          id="islamic-pattern-emerald"
                          x="0"
                          y="0"
                          width="8"
                          height="8"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="4" cy="4" r="0.5" fill="currentColor" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#islamic-pattern-emerald)" />
                      </svg>
                    </div>
                    <span className="relative z-10">Learn More</span>
                    <motion.div
                      className="relative z-10"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              {/* Raha Brand Ghost/Outline Buttons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Raha Brand Ghost Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-transparent hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 text-pink-600 hover:text-pink-700 font-medium px-6 py-3 rounded-2xl border-2 border-pink-300 hover:border-pink-400 transition-all duration-300 group flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/50 to-transparent opacity-0 group-hover:opacity-100"
                      animate={{ x: [-100, 200] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-transparent hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-purple-600 hover:text-purple-700 font-medium px-5 py-2.5 rounded-2xl border-2 border-purple-300 hover:border-purple-400 transition-all duration-300 group"
                  >
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </div>

              {/* Raha Brand Icon Buttons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Raha Brand Icon Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-4 rounded-3xl bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-50, 100] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                    <Heart className="w-6 h-6 relative z-10" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-pink-400/40 rounded-full blur-md" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-4 rounded-2xl glass-button border border-pink-200/50 hover:border-pink-300 focus-ring group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Star className="w-6 h-6 text-pink-600 relative z-10" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border border-purple-200 hover:border-purple-300 transition-all duration-300 group"
                  >
                    <User className="w-5 h-5 text-purple-600" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-purple-300/30 rounded-full blur-sm group-hover:bg-purple-300/50 transition-all duration-300" />
                  </motion.button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Button States</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg border border-white/20">
                    <span className="relative z-10">Normal</span>
                  </button>

                  <button className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-xl border border-white/20 scale-105">
                    <span className="relative z-10">Hovered</span>
                  </button>

                  <button className="relative overflow-hidden bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 font-semibold px-6 py-3 rounded-2xl shadow-sm border border-gray-200 cursor-not-allowed opacity-60">
                    <span className="relative z-10">Disabled</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Forms Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="modern-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                Forms & Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Select Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none">
                      <option>Select your city</option>
                      <option>New York</option>
                      <option>London</option>
                      <option>Dubai</option>
                      <option>Istanbul</option>
                    </select>
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">About Yourself</label>
                <textarea
                  placeholder="Tell us about yourself and what you're looking for..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-5 h-5 rounded border-pink-300 text-pink-500 focus:ring-pink-400/20"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the Islamic guidelines and terms of service
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Alerts Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <Card className="modern-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success Alert */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-800 mb-1">Profile Updated Successfully</h4>
                  <p className="text-sm text-emerald-700">
                    Your profile has been updated and is now visible to potential matches.
                  </p>
                </div>
              </motion.div>

              {/* Warning Alert */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Complete Your Profile</h4>
                  <p className="text-sm text-amber-700">
                    Add more photos and information to increase your match potential.
                  </p>
                </div>
              </motion.div>

              {/* Error Alert */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Connection Failed</h4>
                  <p className="text-sm text-red-700">
                    Unable to connect to the server. Please check your internet connection.
                  </p>
                </div>
              </motion.div>

              {/* Info Alert */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">New Feature Available</h4>
                  <p className="text-sm text-blue-700">
                    Try our new voice message feature to connect more meaningfully.
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Modal Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card className="modern-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                Modals & Overlays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <button onClick={() => setShowModal(true)} className="btn-primary">
                Open Modal Example
              </button>
            </CardContent>
          </Card>
        </motion.section>

        {/* Cards Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Card className="modern-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                Cards & Containers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Basic Card */}
                <div className="modern-card p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Basic Card</h3>
                  <p className="text-sm text-gray-600">Simple card with minimal styling</p>
                </div>

                {/* Elevated Card */}
                <div className="modern-card-elevated p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Elevated Card</h3>
                  <p className="text-sm text-gray-600">Card with enhanced shadow</p>
                </div>

                {/* Floating Card */}
                <div className="modern-card-floating p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Floating Card</h3>
                  <p className="text-sm text-gray-600">Card with floating effect</p>
                </div>
              </div>

              {/* Glass Card */}
              <div className="glass-card p-8 text-center border border-pink-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <HeartHandshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Glass Morphism Card</h3>
                <p className="text-gray-600 mb-6">Beautiful glassmorphism effect with backdrop blur</p>
                <button className="btn-secondary">Learn More</button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-card rounded-3xl p-8 max-w-md w-full border border-pink-100/50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 font-display">Modal Example</h2>
              <p className="text-gray-600 mb-8">
                This is a beautiful modal with glassmorphism effects and Islamic-inspired design elements.
              </p>

              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)} className="btn-primary flex-1">
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
