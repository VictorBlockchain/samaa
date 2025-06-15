"use client"

import { useParams } from "next/navigation"
import { ProfileView } from "@/components/profile/profile-view"

export default function ProfilePage() {
  const params = useParams()
  const walletAddress = params.address as string

  return <ProfileView walletAddress={walletAddress} />
}
