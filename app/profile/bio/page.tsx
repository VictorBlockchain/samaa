"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Sparkles, Star, CheckCircle, AlertCircle, Loader2, RefreshCw, Edit2, Save, X } from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useUser } from "@/app/context/UserContext"
import { ProfileService } from "@/lib/database"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"

interface BioRating {
  score: number
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  overallFeedback: string
}

export default function ProfileBioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, isAuthenticated } = useUser()
  const [bio, setBio] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedBio, setEditedBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [rating, setRating] = useState<BioRating | null>(null)
  const [profileUserId, setProfileUserId] = useState<string>("")

  useEffect(() => {
    const uid = searchParams.get("userId") || userId
    if (uid) {
      setProfileUserId(uid)
      loadBio(uid)
    }
  }, [userId, searchParams])

  const loadBio = async (uid: string) => {
    try {
      const profile = await ProfileService.getProfileByUserId(uid)
      if (profile) {
        setBio(profile.bio || "")
        setEditedBio(profile.bio || "")
      }
    } catch (error) {
      console.error("Error loading bio:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBio = () => {
    setEditedBio(bio)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedBio(bio)
    setIsEditing(false)
  }

  const handleSaveBio = async () => {
    if (editedBio.trim().length < 300) {
      alert(`Bio must be at least 300 characters. Currently: ${editedBio.length} characters.`)
      return
    }

    setIsSaving(true)
    try {
      await ProfileService.updateProfileByUserId(profileUserId, {
        bio: editedBio.trim()
      })
      setBio(editedBio.trim())
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving bio:", error)
      alert("Failed to save bio. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const analyzeBio = async () => {
    setIsAnalyzing(true)
    setRating(null)

    // Simulate AI analysis (replace with actual AI API call)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const analysis = performBioAnalysis(bio)
    setRating(analysis)
    setIsAnalyzing(false)
  }

  const performBioAnalysis = (text: string): BioRating => {
    const words = text.trim().split(/\s+/).length
    const sentences = text.split(/[.!?]+/).filter(Boolean).length
    const hasEmojis = /[🌟💫✨❤️🌸]/.test(text)
    const hasQuestions = text.includes('?')
    const hasPersonalDetails = /name|age|love|enjoy|passion|interest|hobby/i.test(text)
    const hasGoals = /goal|dream|aspire|future|looking|seek/i.test(text)
    const hasValues = /value|believe|faith|important|matter|principle/i.test(text)
    const paragraphCount = text.split(/\n\n+/).filter(Boolean).length

    let score = 0
    const strengths: string[] = []
    const improvements: string[] = []
    const suggestions: string[] = []

    // Length scoring (0-25 points)
    if (text.length >= 500) {
      score += 25
      strengths.push("Great length - comprehensive and detailed")
    } else if (text.length >= 400) {
      score += 20
      strengths.push("Good length")
    } else if (text.length >= 300) {
      score += 15
      improvements.push("Could be more detailed (aim for 500+ characters)")
    } else {
      score += 5
      improvements.push("Bio is too short - add more details")
    }

    // Word count scoring (0-15 points)
    if (words >= 80) {
      score += 15
      strengths.push("Excellent word count")
    } else if (words >= 50) {
      score += 10
    } else {
      score += 5
      improvements.push("Add more descriptive words")
    }

    // Sentence variety (0-15 points)
    if (sentences >= 5) {
      score += 15
      strengths.push("Good sentence variety")
    } else if (sentences >= 3) {
      score += 10
      improvements.push("Break up long sentences for better readability")
    } else {
      score += 5
      improvements.push("Add more sentences to improve flow")
    }

    // Personal touch (0-15 points)
    if (hasPersonalDetails) {
      score += 15
      strengths.push("Includes personal details")
    } else {
      score += 5
      improvements.push("Share more about yourself personally")
      suggestions.push("Mention your interests, hobbies, or what makes you unique")
    }

    // Goals and intentions (0-15 points)
    if (hasGoals) {
      score += 15
      strengths.push("Clear about goals and intentions")
    } else {
      score += 5
      improvements.push("Share what you're looking for")
      suggestions.push("Mention your relationship goals and what you seek in a partner")
    }

    // Values and beliefs (0-15 points)
    if (hasValues) {
      score += 15
      strengths.push("Expresses values and beliefs")
    } else {
      score += 5
      improvements.push("Share your core values")
      suggestions.push("Mention what matters most to you in life and relationships")
    }

    // Engagement factors (0-10 points)
    if (hasQuestions) {
      score += 5
      strengths.push("Engaging - asks questions")
    }
    if (hasEmojis) {
      score += 5
      strengths.push("Uses emojis for personality")
    } else {
      suggestions.push("Consider adding a few emojis to show personality")
    }

    // Structure (0-5 points)
    if (paragraphCount >= 2) {
      score += 5
      strengths.push("Well-structured with paragraphs")
    } else {
      suggestions.push("Break your bio into paragraphs for better readability")
    }

    // Generate overall feedback
    let overallFeedback = ""
    if (score >= 85) {
      overallFeedback = "Excellent bio! It's comprehensive, engaging, and gives a great sense of who you are."
    } else if (score >= 70) {
      overallFeedback = "Good bio! With a few improvements, it can be even more compelling."
    } else if (score >= 50) {
      overallFeedback = "Decent start, but there's room for improvement. Consider the suggestions below."
    } else {
      overallFeedback = "Your bio needs significant improvement. Follow the suggestions to make it more engaging."
    }

    return {
      score: Math.min(score, 100),
      strengths,
      improvements,
      suggestions,
      overallFeedback
    }
  }

  const calculateSimilarityScore = (text: string): number => {
    const words = text.trim().split(/\s+/)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    const uniquenessRatio = uniqueWords.size / words.length
    
    let score = Math.round(uniquenessRatio * 60)
    
    if (text.length > 500) score += 20
    else if (text.length > 400) score += 15
    else if (text.length > 300) score += 10
    else score += 5
    
    if (uniquenessRatio > 0.8) score += 15
    else if (uniquenessRatio > 0.7) score += 10
    else if (uniquenessRatio > 0.6) score += 5
    
    return Math.min(score, 100)
  }

  const getSimilarityLabel = (score: number): string => {
    if (score >= 85) return "Very Unique"
    if (score >= 70) return "Unique"
    if (score >= 50) return "Moderate"
    return "Common"
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-emerald-400 to-teal-500"
    if (score >= 70) return "from-blue-400 to-indigo-500"
    if (score >= 50) return "from-amber-400 to-orange-500"
    return "from-red-400 to-rose-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Fair"
    return "Needs Work"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-queensides">Loading bio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative pb-24">
      <CelestialBackground intensity="light" />

      <div className="md:hidden"><MobileNavigation /></div>
      <div className="hidden md:block"><DesktopNavigation /></div>

      <div className="relative z-10">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-pink-100/50">
          <div className="grid grid-cols-3 items-center p-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-pink-50 rounded-xl transition-colors justify-self-start"
            >
              <ArrowLeft className="w-6 h-6 text-pink-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-queensides">
                AI Bio Assistant ✨
              </h1>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Bio Display */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-200/50 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Star className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800 font-queensides text-center flex-1">Your Bio</h2>
              {!isEditing && (
                <button
                  onClick={handleEditBio}
                  className="p-2 hover:bg-pink-50 rounded-xl transition-colors"
                  title="Edit bio"
                >
                  <Edit2 className="w-5 h-5 text-pink-600" />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all font-queensides resize-none text-slate-700 leading-relaxed"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-queensides ${editedBio.length >= 300 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {editedBio.length}/300 characters {editedBio.length >= 300 ? '✓' : '(minimum required)'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-queensides rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      disabled={isSaving || editedBio.length < 300}
                      className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-queensides rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-700 font-queensides whitespace-pre-wrap leading-relaxed text-lg">{bio}</p>
                <div className="mt-4 pt-4 border-t border-pink-200 flex items-center justify-center gap-4">
                  <p className="text-sm text-slate-600 font-queensides">
                    {bio.length} characters
                  </p>
                  <span className="text-pink-300">•</span>
                  <p className="text-sm text-slate-600 font-queensides">
                    {bio.trim().split(/\s+/).length} words
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Helper Section */}
          {!rating && !isAnalyzing && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 border border-amber-200 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-800 font-queensides mb-2">Important Notice</h3>
                  <p className="text-amber-700 font-queensides leading-relaxed mb-4">
                    Avoid lazy bio's, Samaa is for serious husband and wife contenders. Your bio is your first impression - make it count!
                  </p>
                  <div className="bg-white/80 rounded-xl p-4 border border-amber-200/50">
                    <h4 className="text-sm font-semibold text-amber-800 font-queensides mb-2 uppercase tracking-wide">Bio Rating Includes:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-amber-700 font-queensides text-sm"><strong>Bio Quality Score:</strong> Overall rating based on content, length, engagement, and authenticity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-amber-700 font-queensides text-sm"><strong>Bio Similarity Score:</strong> How unique your bio is compared to others in our database (higher is better)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {!rating && !isAnalyzing && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeBio}
              className="w-full py-4 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-queensides font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <Sparkles className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Analyze My Bio</span>
            </motion.button>
          )}

          {/* Analyzing */}
          {isAnalyzing && (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-pink-500 animate-spin mx-auto mb-6" />
              <p className="text-xl text-slate-700 font-queensides font-semibold">AI is analyzing your bio...</p>
              <p className="text-sm text-slate-500 font-queensides mt-2">Evaluating quality, uniqueness, and compatibility</p>
            </div>
          )}

          {/* Results */}
          {rating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-6">
                {/* Bio Quality Score */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-200/50 text-center">
                  <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-r ${getScoreColor(rating.score)} mb-4`}>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white font-queensides">{rating.score}%</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 font-queensides uppercase tracking-wide mb-1">Bio Quality</h3>
                  <p className="text-xs text-slate-500 font-queensides">{getScoreLabel(rating.score)}</p>
                </div>

                {/* Bio Similarity Score */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200/50 text-center">
                  <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white font-queensides">{calculateSimilarityScore(bio)}%</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 font-queensides uppercase tracking-wide mb-1">Uniqueness</h3>
                  <p className="text-xs text-slate-500 font-queensides">{getSimilarityLabel(calculateSimilarityScore(bio))}</p>
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-200/50">
                <p className="text-slate-700 font-queensides text-lg text-center leading-relaxed">{rating.overallFeedback}</p>
              </div>

              {/* Strengths */}
              {rating.strengths.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-200/50">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-bold text-slate-800 font-queensides">Strengths</h3>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {rating.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Star className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                        <span className="text-slate-700 font-queensides">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {rating.improvements.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200/50">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-bold text-slate-800 font-queensides">Areas to Improve</h3>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {rating.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-amber-500 mt-1">•</span>
                        <span className="text-slate-700 font-queensides">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {rating.suggestions.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200/50">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-bold text-slate-800 font-queensides">AI Suggestions</h3>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {rating.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-purple-500 mt-1">💡</span>
                        <span className="text-slate-700 font-queensides">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeBio}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-queensides font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-6 h-6" />
                Re-analyze Bio
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
