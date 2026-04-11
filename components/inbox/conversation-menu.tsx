"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MoreVertical,
  BellOff,
  Bell,
  Archive,
  ArchiveRestore,
  Trash2,
  User,
  Ban,
  Flag
} from "lucide-react"

interface ConversationMenuProps {
  partnerId: string
  partnerName: string
  isMuted: boolean
  isArchived: boolean
  onMute: () => void
  onArchive: () => void
  onDelete: () => void
  onBlock: () => void
  onViewProfile: () => void
  onReport: () => void
}

export function ConversationMenu({
  partnerName,
  isMuted,
  isArchived,
  onMute,
  onArchive,
  onDelete,
  onBlock,
  onViewProfile,
  onReport
}: ConversationMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-pink-600" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-56 p-2 space-y-1 rounded-2xl bg-white/95 backdrop-blur-xl border border-pink-100 shadow-xl z-50"
              style={{
                backgroundImage: `
                  linear-gradient(white, white),
                  linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(251, 146, 60, 0.12))
                `,
                backgroundOrigin: 'border-box',
                backgroundClip: 'content-box, border-box'
              }}
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-pink-100/50">
                <p className="text-xs font-semibold text-pink-600 font-queensides uppercase tracking-wider">
                  Conversation Options
                </p>
              </div>

              {/* View Profile */}
              <button
                onClick={() => handleAction(onViewProfile)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-pink-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-queensides text-sm">View Profile</span>
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={() => handleAction(onMute)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-pink-50 transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isMuted 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                    : 'bg-gradient-to-br from-pink-400 to-rose-500'
                }`}>
                  {isMuted ? (
                    <Bell className="w-4 h-4 text-white" />
                  ) : (
                    <BellOff className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-queensides text-sm">
                  {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </span>
              </button>

              {/* Archive/Unarchive */}
              <button
                onClick={() => handleAction(onArchive)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-pink-50 transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isArchived 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                    : 'bg-gradient-to-br from-pink-400 to-rose-500'
                }`}>
                  {isArchived ? (
                    <ArchiveRestore className="w-4 h-4 text-white" />
                  ) : (
                    <Archive className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-queensides text-sm">
                  {isArchived ? 'Unarchive' : 'Archive'}
                </span>
              </button>

              {/* Divider */}
              <div className="h-px bg-pink-100/50 my-1" />

              {/* Report */}
              <button
                onClick={() => handleAction(onReport)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Flag className="w-4 h-4 text-white" />
                </div>
                <span className="font-queensides text-sm">Report User</span>
              </button>

              {/* Block */}
              <button
                onClick={() => handleAction(onBlock)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Ban className="w-4 h-4 text-white" />
                </div>
                <span className="font-queensides text-sm">Block {partnerName}</span>
              </button>

              {/* Divider */}
              <div className="h-px bg-pink-100/50 my-1" />

              {/* Delete */}
              <button
                onClick={() => handleAction(onDelete)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-queensides text-sm">Delete Conversation</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
