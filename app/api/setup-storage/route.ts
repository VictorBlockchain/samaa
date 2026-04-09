import { NextResponse } from "next/server"

// Bucket names must stay in sync with STORAGE_CONFIG.BUCKETS in lib/storage.ts
// Profile media is private (RLS + signed URLs). Shop buckets stay public unless you add RLS later.
const buckets = [
  { name: "profile-photos", public: false, mime: ["image/jpeg","image/jpg","image/png","image/webp"] },
  { name: "profile-videos", public: false, mime: ["video/mp4","video/webm","video/mov","video/avi"] },
  { name: "profile-audio", public: false, mime: ["audio/mp3","audio/mpeg","audio/wav","audio/m4a","audio/ogg"] },
  { name: "shop-images", public: true, mime: ["image/jpeg","image/jpg","image/png","image/webp"] },
  { name: "shop-videos", public: true, mime: ["video/mp4","video/webm","video/mov","video/avi"] },
]

export async function POST() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  const { supabaseAdmin } = await import("@/lib/supabase-admin")
  const { data: existing, error: listErr } = await supabaseAdmin.storage.listBuckets()
  if (listErr) {
    return NextResponse.json({ ok: false, error: listErr.message }, { status: 500 })
  }

  const existingNames = new Set((existing || []).map((b: any) => b.name))
  const results: any[] = []

  const privateProfileBuckets = new Set(["profile-photos", "profile-videos", "profile-audio"])

  for (const b of buckets) {
    if (!existingNames.has(b.name)) {
      const { error: createErr } = await supabaseAdmin.storage.createBucket(b.name, {
        public: b.public,
        fileSizeLimit: "52428800",
        allowedMimeTypes: b.mime,
      })
      if (createErr) {
        results.push({ name: b.name, created: false, error: createErr.message })
        continue
      }
      results.push({ name: b.name, created: true })
    } else {
      if (privateProfileBuckets.has(b.name)) {
        const { error: updErr } = await supabaseAdmin.storage.updateBucket(b.name, {
          public: false,
        })
        if (updErr) {
          results.push({ name: b.name, exists: true, updated: false, error: updErr.message })
        } else {
          results.push({ name: b.name, exists: true, updated: true, public: false })
        }
      } else {
        results.push({ name: b.name, exists: true })
      }
    }
  }

  return NextResponse.json({ ok: true, results })
}
