"use client"

import { motion } from "framer-motion"
import { Heart, Check, X, Sparkles } from "lucide-react"

interface LeadActionsProps {
  messageId: string
  leadStatus: string | null
  onAccept: (messageId: string) => void
  onDecline: (messageId: string) => void
  isProcessing: boolean
}

export function LeadActions({
  messageId,
  leadStatus,
  onAccept,
  onDecline,
  isProcessing
}: LeadActionsProps) {
  // If lead is already accepted or declined, show status
  if (leadStatus === 'accepted') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-emerald-700 font-queensides">
          Lead Accepted
        </span>
      </motion.div>
    )
  }

  if (leadStatus === 'declined') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-rose-700 font-queensides">
          Lead Declined
        </span>
      </motion.div>
    )
  }

  // Show accept/decline buttons for pending leads
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl"
    >
      {/* Lead Badge */}
      <div className="flex items-center justify-center gap-2">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
        </motion.div>
        <span className="text-sm font-semibold text-amber-700 font-queensides uppercase tracking-wider">
          New Lead
        </span>
        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDecline(messageId)}
          disabled={isProcessing}
          className="flex-1 relative overflow-hidden bg-white hover:bg-rose-50 text-rose-600 font-medium px-4 py-3 rounded-xl border border-rose-200 transition-all duration-300 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 font-queensides">
            <X className="w-4 h-4" />
            Decline
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAccept(messageId)}
          disabled={isProcessing}
          className="flex-1 relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-medium px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-100, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2 font-queensides">
            <Heart className="w-4 h-4" />
            Accept Lead
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
