"use client"

import { Suspense } from "react"
import CommunityView from "@/components/community/community-view"

function CommunityContent() {
  return <CommunityView />
}

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-queensides">Loading community...</p>
        </div>
      </div>
    }>
      <CommunityContent />
    </Suspense>
  )
}
