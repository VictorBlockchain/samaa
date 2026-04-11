# Matching Algorithm — Technical Documentation

## Overview

The Samaa matchmaking algorithm lives in `lib/matching.ts` and is exposed via `GET /api/matches`. It uses a **two-phase** approach:

1. **Hard Filters** — applied at the Supabase query level to eliminate incompatible profiles before any scoring.
2. **Soft Scoring** — a 100-point weighted compatibility score calculated client-side across 11 dimensions.

Profiles are returned sorted by `compatibility_score` descending.

---

## Architecture

```
User opens /explore
  → explore-view.tsx calls GET /api/matches?limit=20&offset=0
    → app/api/matches/route.ts authenticates via Supabase session
      → MatchingService.getPotentialMatches(userId, limit, offset)
        → Load current user from `users` table
        → Load preferences from `user_preferences` table
        → Build hard-filtered Supabase query
        → Client-side geofencing via haversine
        → Score each candidate with calculateCompatibility()
        → Sort by score, paginate, return MatchProfile[]
```

**Key files:**

| File | Purpose |
|---|---|
| `lib/matching.ts` | Core algorithm, `MatchProfile` type, `MatchingService` class |
| `app/api/matches/route.ts` | Authenticated API endpoint |
| `components/explore/explore-view.tsx` | Fetches matches and renders the explore UI |
| `components/explore/profile-card.tsx` | Renders individual profile cards with score |
| `components/mobile/swipe-card.tsx` | Mobile swipe UI consuming `MatchProfile[]` |
| `components/profile/profile-match-preferences.tsx` | User edits their match preferences (saved to `user_settings`) |

---

## Hard Filters (Eliminators)

These are applied at the SQL/query level. If a candidate fails any of these, they are **excluded entirely** — no score is calculated.

| # | Filter | Logic |
|---|---|---|
| 1 | **Gender** | Males see only females, females see only males (`gender = oppositeGender`) |
| 2 | **Active status** | Only `is_active = true` profiles |
| 3 | **Self-exclusion** | `id != currentUserId` |
| 4 | **Age range** | Candidate's `age` must be within the user's `age_range_min` .. `age_range_max` from `user_settings` |
| 5 | **Min profile rating** | If user set `min_profile_rating > 0`, candidate's `profile_rating` must be >= that value |
| 6 | **Min chat rating** | If user set `min_chat_rating > 0`, candidate's `chat_rating` must be >= that value |
| 7 | **Marital status** | If user set `preferred_marital_status[]`, candidate's `marital_status` must be in that array |
| 8 | **Nationality** | If user set `preferred_nationality[]`, candidate's `nationality` must be in that array |
| 9 | **Height minimum** | If user set `height_min > 0`, candidate's `height` must be >= that value |
| 10 | **Verified only** | If user set `show_only_verified = true`, candidate must have `is_verified = true` |
| 11 | **Geofencing** | If `anywhere_in_world = false` and user has lat/lng, uses haversine distance to exclude candidates beyond `max_distance` miles |

**Note on geofencing:** The DB has a `location_point` geography column (auto-populated by a trigger from `latitude`/`longitude`). PostGIS `ST_DWithin` could be used server-side via an RPC, but the current implementation does client-side haversine filtering after fetching a 3× pool.

---

## Soft Scoring — 100 Points Total

`calculateCompatibility(currentUser, candidate, userSettings)` returns 0–100.

### 1. Islamic Values — 20 points

| Sub-factor | Points | Logic |
|---|---|---|
| Prayer frequency | 5 | Exact match between current user and candidate |
| Religiosity level | 5 | Exact match |
| Sect | 4 | Exact match (Sunni, Shia, Other) |
| Halal food | 3 | Exact match |
| Marriage intention | 3 | Exact match |

### 2. Shared Interests — 15 points

- Base: `min(overlap_count × 3, 12)` where `overlap_count` = number of shared interest strings
- Cluster bonus: +1 per shared high-compatibility cluster (max +3)
  - Clusters are defined in `HIGH_COMPATIBILITY_CLUSTERS` (e.g., ["Quran study", "Islamic history", "Hadith study"])
- Total capped at 15

### 3. Personality Match — 8 points

- `min(shared_traits × 2.5, 8)` where `shared_traits` = number of overlapping personality trait strings

### 4. Age Proximity — 8 points

| Age gap | Points |
|---|---|
| ≤ 2 years | 8 |
| ≤ 5 years | 6 |
| ≤ 8 years | 4 |
| ≤ 12 years | 2 |
| > 12 years | 0 |

### 5. Location Proximity — 8 points

| Condition | Points |
|---|---|
| Same city | 8 |
| Same state | 6 |
| Same country | 4 |
| Different country | 2 |

### 6. Languages Compatibility — 6 points

- Base: `min(shared_languages × 2, 6)` where `shared_languages` = number of common languages

### 7. Lifestyle Alignment — 8 points

| Sub-factor | Points |
|---|---|
| Smoking match | 2 |
| Alcohol match | 2 |
| Self-care frequency match | 2 |
| Shopping frequency match | 2 |

### 8. Finance & Travel — 12 points

| Sub-factor | Points |
|---|---|
| Finance style match | 3 |
| Travel frequency match | 3 |
| Dining frequency match | 2 |
| Shopping budget compatibility | 2 |
| Self-care budget compatibility | 2 |
| Mahr compatibility | 2 |

**Budget compatibility logic:**
- Type match (both "less_than" or both "greater_than"): 1 point
- Amount within 20% of each other: 1 point

**Mahr compatibility logic:**
- Values within 30% of each other: 2 points

### 9. Education & Career — 5 points

| Sub-factor | Points |
|---|---|
| Education in user's `preferred_education[]` | 3 |
| Profession in user's `occupation_preference[]` | 2 |

### 10. Family Values — 8 points

| Sub-factor | Points |
|---|---|
| Has children matches preference | 2 |
| Wants children matches preference | 2 |
| Willing to relocate matches preference | 2 |
| Marital status in preferred list | 1 |
| Living arrangements similarity | 1 |

### 11. Profile Quality — 5 points

| Condition | Points |
|---|---|
| Has profile photo | 1 |
| Has 3+ photos | 1 |
| Has video intro | 1 |
| Profile rating > 70% | 1 |
| Chat rating > 70% | 1 |

### 12. Mindset & Openness — 8 points ← NEW

| Sub-factor | Points | Logic |
|---|---|---|
| Psychedelics frequency alignment | 3 | Perfect match: 3, Close (occasionally/regularly): 2, Both non-never: 1 |
| Psychedelics type overlap | 2 | `min(shared_types, 2)` |
| Mushroom bonus | 1 | Both use mushroom (natural/spiritual) |
| Openness interests proxy | 2 | Shared interests in spirituality, nature, meditation, philosophy, yoga, mindfulness |

**Why psychedelics matters:**
- Indicates openness to experience (Big 5 personality trait)
- Suggests mental health awareness (microdosing for wellness)
- Shows spiritual exploration (especially mushroom/Sufi traditions)
- Correlates with social outgoing-ness and progressive mindset

### 13. Mutual Fit Bonus — 5 points

| Age gap | Points |
|---|---|
| ≤ 5 years | 5 |
| ≤ 10 years | 3 |
| > 10 years | 0 |

*Simplified proxy for bidirectional age preference matching (ideally would check if the candidate's own `age_range_min`..`age_range_max` includes the current user's age, but that requires loading each candidate's settings).*

---

## Data Points Inventory

Every field collected during profile setup that feeds into the algorithm:

**Basic Identity:** firstName, lastName, age, gender, dob, height, nationality, location (lat/lng/city/state/country)

**Education & Career:** education, profession, employer, job_title

**Islamic Values:** religiosity, prayerFrequency, hijabPreference, marriageIntention, sect, islamicValues, isRevert, alcohol, smoking, psychedelics, halalFood

**Family & Marriage:** maritalStatus, hasChildren, wantChildren, willingToRelocate, mahrMaxAmount/mahrRequirement, workPreference, stylePreference, familyInvolvement, livingArrangements

**Finance & Lifestyle:** financeStyle, diningFrequency, travelFrequency, shoppingFrequency, shoppingBudgetType, shoppingBudgetAmount, selfCareFrequency, selfCareBudgetType, selfCareBudgetAmount, hairStyle, makeUpStyle

**Languages:** languages[] (multi-select array)

**Personality & Interests:** interests[], customInterests[], personality[]

**Media & Quality:** profilePhoto, additionalPhotos, videoIntro, voiceIntro, profile_rating, chat_rating, response_rate, communication_rating, is_verified

---

## Database Dependencies

### Tables queried

- `users` — all user profile data (source of truth for candidate attributes)
- `user_preferences` — current user's match preferences (age range, distance, filters, budgets, languages, etc.)
- `match_interactions` — message/view tracking for `getUsersWhoMessagedMe` / `getUsersIMessaged`

### Migrations required

1. **`2026-04-15_create_user_preferences_table.sql`** — creates new `user_preferences` table (replaces `user_settings`):
   - All preference columns migrated from `user_settings`
   - New budget columns: `shopping_budget_preference_type`, `shopping_budget_preference_amount`, `self_care_budget_preference_type`, `self_care_budget_preference_amount`
   - Languages column: `languages_preference` (TEXT[])
   - Shopping frequency: `shopping_frequency_preference`

2. **`2026-04-15_add_budget_columns_to_user_preferences.sql`** — adds missing budget TEXT columns for backward compatibility

3. **`2026-04-15_add_shopping_frequency_to_user_preferences.sql`** — adds shopping frequency column

4. **`2026-04-11_add_location_point_trigger.sql`** — trigger that auto-populates `location_point` (PostGIS geography) from `latitude`/`longitude` on INSERT/UPDATE. Also backfills existing rows.

---

## MatchProfile Interface

The `MatchProfile` type (`lib/matching.ts`) is the flat shape returned to all UI components. It includes every field the cards need to render plus `compatibility_score` and `distance_miles` computed by the algorithm. Components should **never** query the DB directly — they receive `MatchProfile[]` from the API.

---

## Preference Persistence

Users edit their preferences in `profile-match-preferences.tsx`. The `saveSection()` function maps camelCase UI field names to snake_case `user_preferences` columns:

| UI Field | DB Column |
|---|---|
| `ageRangeMin` | `age_range_min` |
| `ageRangeMax` | `age_range_max` |
| `minProfileRating` | `min_profile_rating` |
| `minChatRating` | `min_chat_rating` |
| `maxDistance` | `max_distance` |
| `anywhereInWorld` | `anywhere_in_world` |
| `preferredNationality` | `preferred_nationality` |
| `preferredMaritalStatus` | `preferred_marital_status` |
| `hasChildren` | `has_children_preference` |
| `wantChildren` | `want_children_preference` |
| `willingToRelocate` | `willing_to_relocate` |
| `heightMin` | `height_min` |
| `preferredReligiosity` | `preferred_religiosity` |
| `prayerFrequency` | `prayer_frequency_preference` |
| `sect` | `sect_preference` |
| `isRevert` | `is_revert_preference` |
| `alcohol` | `alcohol_preference` |
| `smoking` | `smoking_preference` |
| `psychedelics` | `psychedelics_preference` |
| `halalFood` | `halal_food_preference` |
| `preferredEducation` | `preferred_education` |
| `preferredOccupation` | `occupation_preference` |
| `financeStyle` | `finance_style_preference` |
| `diningFrequency` | `dining_frequency_preference` |
| `travelFrequency` | `travel_frequency_preference` |
| `shoppingFrequency` | `shopping_frequency_preference` |
| `shoppingBudgetType` | `shopping_budget_preference_type` |
| `shoppingBudgetAmount` | `shopping_budget_preference_amount` |
| `selfCareFrequency` | `self_care_frequency_preference` |
| `selfCareBudgetType` | `self_care_budget_preference_type` |
| `selfCareBudgetAmount` | `self_care_budget_preference_amount` |
| `languages` | `languages_preference` |

Uses `upsert` with `onConflict: "user_id"` so preferences are created on first save and updated thereafter.

---

## Future Improvements

- **Server-side geofencing**: Use PostGIS `ST_DWithin` via a Supabase RPC for more efficient radius filtering instead of fetching a 3× pool and filtering client-side.
- **True mutual fit scoring**: Load each candidate's `user_settings` to check if the current user's age falls within the candidate's preferred range (currently approximated by age gap).
- **Swipe history exclusion**: Exclude profiles the user has already swiped left on (requires a `swipe_history` table).
- **ML-based re-ranking**: Use engagement signals (message response rates, conversation lengths) to boost profiles that historically lead to successful connections.
- **Decay weighting**: Recently active users get a slight boost over dormant ones.
