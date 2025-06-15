import { ProfileSetup } from "@/components/auth/profile-setup"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function ProfileSetupPage() {
  return (
    <div className="min-h-screen relative">
      <CelestialBackground intensity="medium" />
      <ProfileSetup />
    </div>
  )
}
