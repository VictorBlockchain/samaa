"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, Sparkles, Heart, MessageCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion, AnimatePresence } from "framer-motion"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { ProfileCard } from "./profile-card"
import { MatchingService, UserProfile } from "@/lib/matching"



export function ExploreView() {
  const [activeTab, setActiveTab] = useState<"wants-you" | "potentials" | "you-want-them">("potentials")
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([])
  const [usersWhoMessagedMe, setUsersWhoMessagedMe] = useState<UserProfile[]>([])
  const [usersIMessaged, setUsersIMessaged] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  const router = useRouter()
  const { connected, publicKey } = useWallet()

  // Load matches when component mounts or tab changes
  useEffect(() => {
    if (connected && publicKey) {
      loadMatches()
    }
  }, [connected, publicKey, activeTab])

  const loadMatches = async () => {
    if (!publicKey) return

    setIsLoading(true)
    try {
      switch (activeTab) {
        case 'potentials':
          const matches = await MatchingService.getPotentialMatches(publicKey.toString())
          setPotentialMatches(matches)
          break
        case 'wants-you':
          const messagesReceived = await MatchingService.getUsersWhoMessagedMe(publicKey.toString())
          setUsersWhoMessagedMe(messagesReceived)
          break
        case 'you-want-them':
          const messagesSent = await MatchingService.getUsersIMessaged(publicKey.toString())
          setUsersIMessaged(messagesSent)
          break
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProfile = async (profile: UserProfile) => {
    if (!publicKey) return

    // Record profile view
    await MatchingService.recordProfileView(publicKey.toString(), profile.wallet_address)

    // Navigate to profile page
    router.push(`/profile/${profile.wallet_address}`)
  }

  const handleSendMessage = (profile: UserProfile) => {
    if (!publicKey) return

    // Navigate to messaging interface to compose message
    router.push(`/messages/compose/${profile.wallet_address}`)
  }



  const getCurrentMatches = () => {
    switch (activeTab) {
      case 'potentials':
        return potentialMatches
      case 'wants-you':
        return usersWhoMessagedMe
      case 'you-want-them':
        return usersIMessaged
      default:
        return []
    }
  }

  const currentMatches = getCurrentMatches()
  const currentMatch = currentMatches[currentMatchIndex]

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Explore</h1>
              <p className="text-sm text-slate-600 font-queensides">Discover your matches</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-3 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
              <button
                onClick={() => setActiveTab("wants-you")}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  activeTab === "wants-you"
                    ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="text-2xl mb-1">💌</div>
                <div className="text-xs font-queensides text-slate-600 leading-tight">Wants You</div>
                {activeTab === "wants-you" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("potentials")}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  activeTab === "potentials"
                    ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="text-2xl mb-1">🔍</div>
                <div className="text-xs font-queensides text-slate-600 leading-tight">Potentials</div>
                {activeTab === "potentials" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("you-want-them")}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  activeTab === "you-want-them"
                    ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="text-2xl mb-1">💕</div>
                <div className="text-xs font-queensides text-slate-600 leading-tight">You Want Them</div>
                {activeTab === "you-want-them" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!connected ? (
            /* Not Connected State */
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-amber-200/50"
                >
                  <Users className="w-12 h-12 text-amber-600" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-amber-800 font-qurova mb-4"
                >
                  Connect Your Wallet
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-amber-700 font-queensides leading-relaxed mb-8"
                >
                  Please connect your wallet to discover your matches
                </motion.p>
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-queensides">Finding your matches...</p>
              </div>
            </div>
          ) : currentMatches.length === 0 ? (
            /* No Matches State */
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-slate-200/50"
                >
                  <Heart className="w-12 h-12 text-slate-400" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-slate-700 font-qurova mb-4"
                >
                  {activeTab === 'potentials' && 'No New Matches'}
                  {activeTab === 'wants-you' && 'No Messages Received'}
                  {activeTab === 'you-want-them' && 'You Haven\'t Messaged Anyone'}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-slate-600 font-queensides leading-relaxed mb-8"
                >
                  {activeTab === 'potentials' && 'Check back later for new potential matches based on your preferences'}
                  {activeTab === 'wants-you' && 'When someone sends you a message, they\'ll appear here'}
                  {activeTab === 'you-want-them' && 'Start exploring potential matches and send messages to connect'}
                </motion.p>

                {activeTab !== 'potentials' && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    onClick={() => setActiveTab('potentials')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-queensides transition-all duration-300"
                  >
                    Explore Matches
                  </motion.button>
                )}
              </div>
            </div>
          ) : currentMatchIndex >= currentMatches.length ? (
            /* No More Matches */
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-200/50"
                >
                  <Sparkles className="w-12 h-12 text-green-600" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-green-800 font-qurova mb-4"
                >
                  You've Seen All Matches!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-green-700 font-queensides leading-relaxed mb-8"
                >
                  Check back later for new matches or explore other tabs
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  onClick={() => setCurrentMatchIndex(0)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-queensides transition-all duration-300"
                >
                  Review Matches Again
                </motion.button>
              </div>
            </div>
          ) : (
            /* Show Matches List */
            <div className="space-y-6">
              {/* Matches Counter */}
              <div className="text-center">
                <p className="text-sm text-slate-600 font-queensides">
                  {currentMatches.length} {currentMatches.length === 1 ? 'match' : 'matches'} found
                </p>
              </div>

              {/* Scrollable Matches List */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {currentMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="max-w-md mx-auto"
                  >
                    <ProfileCard
                      profile={match}
                      onViewProfile={() => handleViewProfile(match)}
                      onSendMessage={() => handleSendMessage(match)}
                      showMessageButton={activeTab === 'potentials'}
                      isInMessagedTab={activeTab === 'you-want-them'}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Scroll Hint */}
              {currentMatches.length > 1 && (
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-queensides">
                    Scroll to see more matches
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
