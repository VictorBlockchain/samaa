"use client"

import React, { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import ProfileView from "@/components/profile/profile-view"
import { ProfileMatchPreferences } from "@/components/profile/profile-match-preferences"

function ProfileInner() {
  const searchParams = useSearchParams()
  const userId = (searchParams.get("userId") || "").trim()
  const [viewMode, setViewMode] = useState<"profile" | "preferences">("profile")
  
  if (!userId) return null

  if (viewMode === "preferences") {
    return <ProfileMatchPreferences onBack={() => setViewMode("profile")} />
  }

  return <ProfileView userId={userId} onShowPreferences={() => setViewMode("preferences")} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileInner />
    </Suspense>
  )
}
