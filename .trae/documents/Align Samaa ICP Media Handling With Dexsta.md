## Summary
We will align media storage and retrieval in Samaa with the Dexsta pattern: store canonical references (path/assetId), use dev-safe actor retrieval to render data URLs locally, and use raw HTTP domains in production. This removes brittle https assumptions and ensures images/audio/video load reliably.

## Key Changes
- Create a single media resolver API used everywhere:
  - `resolveMediaPath(path)` → returns a renderable URL
  - `resolveMediaPaths(paths)` → batch version
  - Dev: fetch bytes via `get_asset(key)` and return `data:<mime>;base64,...`
  - Prod: build raw URLs with `https://<canister>.icp0.io/<path>`
- Upload return shape and storage:
  - Upload returns `{ path, contentType, size }` (optionally `assetId` later)
  - Persist `path` only in profile records (`media.photos`, `videoIntro`, `voiceNote`)
  - Keep existing chunked upload; add sha256 later if needed
- Profile view rendering:
  - Normalize sources from `media.photos` or fallback `photos`, `profilePhoto`, `video`, `voiceIntro`
  - Resolve all media via the resolver before rendering
  - Use data URLs for the hero background and section breaks in dev; raw URLs in prod
- Logging & dev visibility:
  - Log `{ path, resolvedUrl }` for each rendered media
  - Optional dev-only overlay showing the hero image resolved URL for quick diagnostics

## Files To Update
- `lib/icp-media.ts`
  - Add `get_asset` to Candid interface (query)
  - Implement `fetchMediaDataUrl(path)` and helpers
  - Export `resolveMediaPath(s)` and `IS_LOCAL`
  - Keep `buildMediaUrlFromPath` for prod raw URLs
- `canisters/media/main.mo`
  - Add `get_asset(key) : query -> Opt<(contentType, Bytes)>`
  - Keep existing `http_request` and chunked upload methods
- `components/profile/profile-view.tsx`
  - Resolve media via `resolveMediaPath(s)` during load
  - Render hero and photo-break sections using resolved URLs
  - Show media badges: photo count, video/audio present
  - Add dev-only overlay for hero URL (optional)
- `components/auth/profile-setup.tsx`
  - Ensure upload handlers store returned `path` only
  - Skip photo-required for local testing; re-enable for prod later
- `utils/profile-storage.ts`
  - Ensure Supabase upsert maps `media.photos`, `videoIntro`, `voiceNote` using stored paths

## Verification Plan
- Use an existing saved path like `/dev-anon-.../1766411039352.png` and confirm:
  - Dev: `resolveMediaPath` returns `data:image/png;base64,...` that renders in hero and photo breaks
  - Prod: `https://<canister>.icp0.io/<principal>/<file>` loads in `<img>`
- Check console logs for `Resolved media` entries and open URLs directly if needed
- Test audio (`audio/mpeg`) and video (`video/mp4`) rendering similarly

## Follow-ups (if needed)
- Add Dexsta-style asset IDs and `/asset/<assetId>` routing once bridge canister is integrated
- Add sha256 metadata and parallel chunk uploads for integrity and speed
- Move dev overlay behind an env flag to avoid production noise