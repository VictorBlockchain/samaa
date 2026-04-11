# Supabase Error Fixes

## 1. 406 (Not Acceptable) — `.single()` vs `.maybeSingle()`

### Problem
PostgREST returns **406 Not Acceptable** when `.single()` is used and zero rows match the query. This happened across multiple tables:
- `user_video_preferences` — no preferences set yet
- `video_flags` — user hasn't flagged a video
- `video_likes` — user hasn't liked a video
- `shops` — user doesn't have a shop (via `userHasShop()`)

### Root Cause
`.single()` expects **exactly one row**. When no rows exist, PostgREST throws a 406 instead of returning `null`.

### Fix
Replace `.single()` with `.maybeSingle()` for any query where **zero results is a valid outcome** (existence checks, optional preferences, etc.):

```ts
// BAD — throws 406 when no rows match
const { data, error } = await supabase
  .from("video_likes")
  .select("id")
  .eq("video_id", videoId)
  .eq("user_id", userId)
  .single()

// GOOD — returns null when no rows match
const { data, error } = await supabase
  .from("video_likes")
  .select("id")
  .eq("video_id", videoId)
  .eq("user_id", userId)
  .maybeSingle()
```

Also add defensive error handling to ignore residual 406/PGRST116 codes:

```ts
if (error && error.code !== "PGRST116") {
  if (error.code !== "406") {
    console.error("Error:", error)
  }
  return false
}
```

### Files Fixed
- `lib/social.ts` — `hasUserLiked()`, `hasUserFlagged()`, `userHasShop()`
- `app/social/page.tsx` — `loadUserPreferences()`

---

## 2. Video / Thumbnail 404 — Storage Paths vs Signed URLs

### Problem
Videos and thumbnails showed 404 errors like:
```
GET http://localhost:3000/social/7a7adf62-.../1775709430843.jpeg 404
NotSupportedError: The element has no supported sources.
```

### Root Cause
The database stores **storage paths** (e.g. `7a7adf62/videos/abc123.mp4`), not full URLs. When these paths were passed directly to `<video src=...>` or `<img>`, the browser tried to load them as relative URLs from `localhost:3000`, which doesn't exist.

The profile-view already solved this correctly — it uses `getSignedUrlForPath()` to convert storage paths into time-limited signed URLs before rendering.

### Fix
Follow the **profile-view pattern**: convert all storage paths to signed URLs when loading data, before passing to components.

```ts
import { getSignedUrlForPath, storagePathFromUrlOrPath } from "./storage"

// Convert video storage path to signed URL
const signedVideoUrl = await getSignedUrlForPath("social-videos", video.video_url, 7200)

// Convert thumbnail storage path to signed URL
const signedThumbnailUrl = video.thumbnail_url
  ? await getSignedUrlForPath("social-videos", video.thumbnail_url, 7200)
  : null

// Convert user's profile photo (from profile-photos bucket) for thumbnail fallback
const rawPhoto = video.user?.profile_photos?.[0] || video.user?.profile_photo
if (rawPhoto) {
  const photoPath = storagePathFromUrlOrPath("profile-photos", rawPhoto)
  userProfilePhoto = await getSignedUrlForPath("profile-photos", photoPath, 7200)
}
```

### Thumbnail Fallback
When no thumbnail is uploaded, use the video creator's first profile photo as the poster image. The video card validates URLs before using them:

```tsx
poster={
  video.thumbnail_url?.startsWith('http')
    ? video.thumbnail_url
    : (video.user?.profile_photo?.startsWith('http') ? video.user.profile_photo : undefined)
}
```

### Key Rule
**Never pass raw storage paths to HTML elements.** Always convert to signed URLs first. Store paths in the database, resolve to URLs at load time.

**All media buckets are PRIVATE** — use `getSignedUrlForPath()` (creates time-limited signed URLs via `createSignedUrl`). Never use `getPublicUrl()` for media buckets.

Buckets: `profile-photos`, `profile-videos`, `profile-audio`, `social-videos`, `shop-images`, `shop-videos`

### Files Fixed
- `lib/social.ts` — `getVideos()`, `getVideoById()`, `getUserVideos()` now resolve signed URLs
- `components/social/video-card.tsx` — poster fallback validates URLs start with `http`
- `components/social/video-upload.tsx` — stores path only (not full URL) in database

---

## 3. 500 (Internal Server Error) — Nested Select Joins

### Problem
Supabase nested select queries like `order_items (...)` or `products!inner(...)` cause 500 errors:
```typescript
// BAD — causes 500 error
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      id, product_name, quantity
    )
  `)
```

### Root Cause
Supabase's PostgREST doesn't reliably handle nested foreign key joins, especially with complex relationships or when foreign keys aren't properly configured.

### Fix
**Use separate queries instead of nested selects:**

```typescript
// GOOD — fetch orders first
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)

// Then fetch related items separately
const ordersWithItems = await Promise.all(
  orders.map(async (order) => {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
    
    return { ...order, items: items || [] }
  })
)
```

**For cart items (batch query pattern):**

```typescript
// Fetch cart items
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('*')
  .eq('user_id', userId)

// Fetch all products in one query
const productIds = cartItems.map(item => item.product_id)
const { data: products } = await supabase
  .from('products')
  .select('id, name, images, base_price, shop_id')
  .in('id', productIds)

// Create lookup map for efficient joining
const productMap = new Map(products.map(p => [p.id, p]))

// Transform with joined data
const items = cartItems.map(item => ({
  ...item,
  product: productMap.get(item.product_id)
}))
```

### Files Fixed
- `components/shop/shop-view.tsx` — `loadOrders()` uses separate queries
- `lib/cart.ts` — `getCartItems()` uses batch query pattern with Maps
