"use client"

import React, { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ProfileView from "@/components/profile/profile-view"

function ProfileInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = (searchParams.get("userId") || "").trim()
  
  if (!userId) return null

  return <ProfileView userId={userId} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileInner />
    </Suspense>
  )
}
