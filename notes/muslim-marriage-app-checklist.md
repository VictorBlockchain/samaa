# Muslim Marriage/Dating App Checklist

Use this checklist to track features as we build. Check items when implemented and deployed.

## Core Safety & Identity
- [ ] Strong identity verification (documents, liveness, wallet attestations)
- [ ] Age gates and jurisdiction-aware legal compliance
- [ ] Privacy controls (profile visibility scopes, photo privacy/blur until mutual interest)
- [ ] Blocklist and report flows with clear categories (harassment, inappropriate content, spam)

## Islamic Process & Guardianship
- [x] Wali/guardian involvement (links, invites, approvals) — backend tables & consent flow
- [ ] Chaperoned mode (guardian/chaperone auto-added to DMs)
- [ ] Intent clarity (marriage timeline, readiness, preferred process: family/imam)
- [ ] Istikhara tools (reminders, journaling, private notes)

## Matching & Discovery
- [ ] Detailed preferences (age, radius, education, occupation, religiosity)
- [ ] Opposite-gender search defaults with conduct guidance
- [ ] Smart ranking (location, bio quality, communication rating, shared interests, responsiveness)
- [ ] Advanced filters (language, ethnicity, convert/revert, hijab/niqab observance, dietary)

## Communication & Boundaries
- [x] One-on-one DMs and public/private rooms — backend schema & functions
- [ ] Timeboxed chats and rate limiting to prevent spam
- [ ] Content safety (NSFW image detection, link scanning, culturally tuned profanity filters)
- [ ] Message requests (accept/decline before chat starts)

## Mahr & Contracts
- [x] Mahr proposals tied to on-chain contract (propose, accept/reject, return/withdraw)
- [ ] Vault visibility with role-based access (suitor/bride/guardian)
- [ ] Contract notes (expectations/conditions), reminders for unlock dates and policies
- [x] Indexer/upsert flows for on-chain events — upsert function present (audit trails TBD)

## Verification & Trust
- [ ] Multi-tier badges (identity, community references, imam endorsement, guardian confirmation)
- [ ] Ratings: communication, photos, bio completeness
- [ ] Reputation signals (punctuality, response speed, conduct adherence)
- [ ] Reference/endorsement system from trusted community members

## Moderation & Policy
- [ ] Code of conduct aligned with adab (respectful language, boundaries)
- [ ] Auto-flagging and moderation queues, reviewer assignment, SLA
- [ ] Appeals process and transparent outcomes
- [ ] Shadow bans for severe violations
- [x] User-to-user blocking (scoped: messages/chat/meeting/proposal) — backend
- [x] Global ban/unban — backend
- [x] Probation settings (rate limiting, max conversations) — backend
- [ ] UI for blocking, bans, and probation management

## Meetings & Events
- [x] Meeting requests with chaperone scheduling and etiquette prompts — backend functions
- [ ] Chaperone directory and scheduler (invite guardian/chaperone)
- [ ] Imam directory and nikah scheduling with document checklist
- [ ] Community events (lectures, counseling, Q&A rooms)

## Community & Education
- [ ] Knowledge sections (rights/obligations, mahr guidance)
- [ ] Language support and translations for Quranic terms
- [ ] Curated resources from reputable scholars and organizations

## Internationalization & Accessibility
- [ ] Multilingual UI (Arabic, Urdu/Hindi, English, Bahasa, etc.)
- [ ] Localized prayer times and Ramadan/Eid awareness in UX
- [ ] Accessibility (screen readers, contrast, dyslexia-friendly typography)

## Analytics & Feedback
- [ ] Safety dashboards (reports, bans, retention of verified vs. unverified)
- [ ] Matching effectiveness (response rates, meeting conversions, proposals per interactions)
- [ ] Anonymous feedback loops (comfort, respectfulness, intention clarity)

## Tech & Infra
- [ ] Role-based access (admins, moderators, imams, guardians)
- [ ] Secure media storage (signed URLs), encryption for sensitive fields
- [ ] Queue-based indexer for on-chain events; retries and reconciliation jobs
- [ ] Audit logs for sensitive actions

## Data Models (Suggested Additions)
- [x] Guardians (`guardians`, `user_guardian_links` with roles and consent)
- [x] Meetings (`meeting_requests` with participants, chaperone, location, status)
- [ ] Verification (`verification_requests` with type, status, reviewer, notes)
- [ ] Moderation (`reports`, `moderation_actions`, `appeals`)
- [ ] Community roles (`community_roles`, `availability_slots` for imams/chaperones)
- [x] Proposals (`marriage_proposals` linking intent/timeline to mahr)
- [x] E-commerce (`shops`, `products`, `product_variants`, `product_categories`)
- [x] Shopping (`shopping_carts`, `cart_items`, `orders`, `order_items`, `payments`)
- [x] Reviews (`product_reviews`, `shop_reviews`, `wishlists`)
- [x] Inventory (`inventory` with stock tracking and reservations)

## Chats & Chatrooms
- [x] DMs: create/find, membership, send, mark read
- [x] Rooms: create, join/leave, bans, capacity, moderation
- [x] Inbox: last message preview, unread counts, mute/pin
- [ ] Reactions and read receipts (read receipts done; reactions UI/API pending)

## Search & Discovery (Data)
- [x] Unified search (radius, filters, sorting, pagination)
- [x] Indexes for location, gender, age, interests, ratings
- [ ] Opposite-gender defaults and respectful prompts

## E-Commerce & Shop System
- [x] Shop database schema (shops, categories, products, variants, inventory) — backend
- [x] Product categories for Muslim fashion (men/women clothing, wedding items, gifts) — backend
- [x] Product variants with size, color, and custom options — backend
- [x] Inventory management with stock tracking and reservations — backend
- [x] Shopping cart functionality — backend
- [x] Order management system (orders, order_items, payments, shipping) — backend
- [x] Shop management functions (create, update, product management) — backend
- [x] Shopping functions (browse, cart, checkout, tracking) — backend
- [x] Payment processing integration — backend
- [x] Product reviews and shop ratings — backend
- [x] Wishlist functionality — backend
- [x] Advanced product search with filters — backend
- [x] Shop analytics and reporting — backend
- [ ] Shop creation and setup UI
- [ ] Product catalog browsing interface
- [ ] Product detail pages with variant selection
- [ ] Shopping cart and checkout flow UI
- [ ] Order tracking and history interface
- [ ] Shop management dashboard for owners
- [ ] Product management interface (add/edit/inventory)
- [ ] Shop analytics dashboard
- [ ] Review and rating system UI
- [ ] Wishlist management interface
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Shipping integration and tracking
- [ ] Mobile-responsive shop interfaces

## Frontend UI Tasks
- [ ] Inbox feed using `get_user_inbox_unified`
- [ ] Guardian consent modals
- [ ] Meeting request flow with chaperone selection and etiquette preview
- [ ] Proposal creation/respond UI tied to `marriage_proposals`
- [ ] Shop and e-commerce interfaces (see E-Commerce section above)

---

Notes:
- Prioritize safety, consent, and cultural alignment in every feature.
- Default to privacy-first UX; expose options to involve guardians/chaperones.
- Ensure features are configurable per jurisdiction and community norms.