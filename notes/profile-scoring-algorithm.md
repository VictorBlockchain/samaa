# Profile Scoring Algorithm — Technical Documentation

## Overview

The profile scoring algorithm lives in `components/profile/profile-view.tsx` inside the `calculateProfileScore()` function. It evaluates a user's profile completeness across **12 weighted dimensions**, producing a score from 0–100 that is displayed on the profile page and persisted to the `users.profile_rating` column in Supabase.

---

## Architecture

```
User taps Profile Score card (own profile only)
  → ProfileScoreModal opens
    → 2.2s "Scoring your profile…" animation with spinner
    → calculateProfileScore(profile) runs
    → Results phase:
        - Animated SVG ring shows total %
        - Stagger-revealed breakdown rows (120ms each)
        - Each row has icon, label, points/max, detail text, progress bar
    → onScoreCalculated callback fires
        - UPDATE users SET profile_rating = score WHERE id = userId
        - Local state updated so the card reflects the new score immediately
```

**Key files:**

| File | Purpose |
|---|---|
| `components/profile/profile-view.tsx` | `calculateProfileScore()`, `ProfileScoreModal`, click handler on Profile Score card |
| `lib/database.ts` | `ProfileService` — reads/writes profile data |
| `lib/supabase.ts` | Supabase client used for the direct `UPDATE` |
| `schema/migrations/2026-04-12_rename_bio_to_profile_rating.sql` | Renamed `bio_rating` → `profile_rating` |

---

## Scoring Dimensions — 100 Points Total (13 dimensions)

### 1. Basic Info — 10 pts

| Field | Points |
|---|---|
| First name filled | 2 |
| Age filled | 2 |
| Gender filled | 1 |
| City or location filled | 2 |
| Nationality filled | 2 |
| Height filled | 1 |

### 2. Photos — 12 pts

| Photo count | Points |
|---|---|
| 0 | 0 |
| 1 | 3 |
| 2 | 5 |
| 3 | 7 |
| 4 | 10 |
| 5+ | 12 |

### 3. Video Intro — 8 pts

All-or-nothing: 8 pts if `videoIntro` exists, 0 otherwise.

### 4. Voice Intro — 7 pts

All-or-nothing: 7 pts if `voiceIntro` exists, 0 otherwise.

### 5. Bio — 10 pts (character-count tiers)

| Character count | Points |
|---|---|
| 0 | 0 |
| 1–50 | 2 |
| 51–150 | 5 |
| 151–300 | 8 |
| 301+ | 10 |

### 6. Islamic Values — 14 pts ⭐ (bonus for 5 daily prayers)

| Condition | Points |
|---|---|
| Religiosity filled | +2 |
| Religiosity is "practicing" or "very practicing" | +1 bonus |
| Prayer frequency filled | +2 |
| **5 daily prayers** (matches `5 daily`, `five daily`, `all five`, `5 times`, `five times`) | **+3 bonus** |
| Sect filled | +2 |
| Halal food filled | +2 |
| Marriage intention filled | +2 |

- Total capped at 14
- The 5 daily prayers bonus (+3) is called out in the detail text: `"5 daily prayers (+3 bonus)"`

### 7. Education & Career — 5 pts

- Education filled: 2.5 pts (rounded)
- Profession filled: 2.5 pts (rounded)

### 8. Psychedelics — 15 pts ⭐ (highest-value category)

This is the most rewarding single category, designed to encourage openness about psychedelic preferences. Mushroom users get the biggest bonus in the entire algorithm.

| Condition | Points |
|---|---|
| Psychedelics preference set at all | +3 |
| 1 type selected | +2 |
| 2 types selected | +3 |
| 3+ types selected | +4 |
| **Mushroom bonus** (type matches `mushroom`, `psilocybin`, or `shroom`) | **+8** |

- Total capped at 15
- The mushroom bonus (+8) is the single largest individual bonus in the algorithm
- Detail text explicitly calls out the mushroom bonus when present: `"Mushrooms selected (+8 bonus) · N types"`

**Scoring examples:**
- Preference set + 1 type (not mushrooms): 3 + 2 = **5 pts**
- Preference set + 2 types including mushrooms: 3 + 3 + 8 = **14 pts**
- Preference set + 3 types including mushrooms: 3 + 4 + 8 = **15 pts** (max)

### 9. Finance & Style — 8 pts ⭐ (new — rewards thrift & natural aesthetics)

| Condition | Points |
|---|---|
| Finance style filled | +2 |
| **Thrifty spender** (matches `thrift`, `frugal`, `saver`, `budget`) | **+2 bonus** |
| Responsible spender (matches `responsible`, `balanced`, `moderate`) | +1 bonus |
| Hair style filled | +1 |
| **Natural hair** (matches `natural`, `no product`, `minimal`) | **+1 bonus** |
| Shopping frequency filled | +1 |
| Self-care budget filled | +1 |

- Total capped at 8
- Detail text calls out bonuses: `"Thrifty spender (+2 bonus)"` or `"Natural hair (+1 bonus)"`

### 10. Lifestyle — 4 pts

1 pt each for having a value set in (psychedelics & finance scored separately):
- Smoking
- Alcohol
- Self-care frequency
- Remaining lifestyle fields

### 11. Family & Marriage — 4 pts

1 pt each for having a value set in:
- Marital status
- Has children (any answer, including "no")
- Wants children
- Living arrangements

### 12. Polygamy Preferences — 4 pts (character-count tiers)

| Character count of `polygamyReason` | Points |
|---|---|
| 0 | 0 |
| 1–50 | 2 |
| 51–150 | 3 |
| 151+ | 4 |

### 13. Interests & Personality — 7 pts ⭐ (increased weight)

| Condition | Points |
|---|---|
| 1–2 interests | 1 |
| 3–4 interests | 2 |
| 5+ interests | 3 |
| 1 personality trait | 1 |
| 2 personality traits | 3 |
| 3+ personality traits | 4 |

- Total capped at 7

---

## Point Distribution Summary

| # | Dimension | Max | % of Total |
|---|---|---|---|
| 1 | Basic Info | 10 | 10% |
| 2 | Photos | 12 | 12% |
| 3 | Video Intro | 8 | 8% |
| 4 | Voice Intro | 7 | 7% |
| 5 | Bio | 10 | 10% |
| 6 | **Islamic Values** | **14** | **14%** |
| 7 | Education & Career | 5 | 5% |
| 8 | **Psychedelics** | **15** | **15%** |
| 9 | **Finance & Style** | **8** | **8%** |
| 10 | Lifestyle | 4 | 4% |
| 11 | Family & Marriage | 4 | 4% |
| 12 | Polygamy Preferences | 4 | 4% |
| 13 | **Interests & Personality** | **7** | **7%** |
| | **Total** | **108 raw** | **capped at 100** |

> The raw max (108) slightly exceeds 100, giving users with fully-complete profiles a guaranteed 100% even if they miss a minor field. The `Math.min(total, 100)` cap ensures the score never exceeds 100.

---

## Database Persistence

When the modal finishes scoring:

```sql
UPDATE users
SET profile_rating = <score>,
    updated_at = NOW()
WHERE id = <userId>;
```

- Column: `users.profile_rating` — `INTEGER`, constraint `0–100`
- The local React state is also updated so the Profile Score card reflects the new value immediately without a page reload
- The matching algorithm (`lib/matching.ts`) uses `profile_rating` in both hard filters (`min_profile_rating`) and soft scoring (Profile Quality dimension)

---

## Modal UX

1. **Trigger:** Only the logged-in user's own Profile Score card is clickable (`isOwnProfile` check). Other users' profiles show the score but it's not interactive.
2. **Scoring phase (2.2s):** Animated pink spinner with star icon, "Scoring your profile..." title, "Analyzing completeness across 12 dimensions" subtitle.
3. **Results phase:**
   - Animated SVG ring fills to the total percentage with a pink gradient stroke
   - Score label with contextual message:
     - ≥ 80%: "Excellent! Your profile is highly complete"
     - ≥ 60%: "Good profile! A few areas to improve"
     - ≥ 40%: "Getting there — fill more sections to stand out"
     - < 40%: "Needs work — complete more sections to attract matches"
   - Breakdown rows stagger-reveal (120ms apart) with:
     - Green icon background = maxed out
     - Pink icon background = partial
     - Grey icon background = empty (0 pts)
     - Animated progress bar per row

---

## Design Decisions

- **Psychedelics weighted highest** alongside Photos and Bio (15 pts each) to strongly incentivize users to share their psychedelic preferences. Mushrooms receive the single largest individual bonus (+8) to specifically reward that selection.
- **Photos at 20 pts** because visual presentation is the primary driver of engagement on the platform.
- **Character-count tiers** for Bio and Polygamy Preferences reward effort — a one-word answer gets some points, but a thoughtful paragraph earns full marks.
- **Raw max exceeds 100** (110 theoretical) as a buffer so users don't need perfection in every single dimension to hit 100%.

---

## Related Systems

- **Matching Algorithm** (`lib/matching.ts`): Uses `profile_rating` as a hard filter (candidates below `min_profile_rating` are excluded) and as a soft scoring factor (Profile Quality dimension awards 1 pt if profile_rating > 70%).
- **Match Preferences** (`components/profile/profile-match-preferences.tsx`): Users can set a minimum profile rating filter for their potential matches.
