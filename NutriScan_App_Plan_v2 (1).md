# NutriScan — Complete App Planning Document v2
### UI/UX, Feature Architecture, Screen Flow & Design System

**Project Type:** Technopreneurship Mobile App  
**Target Users:** People with chronic illnesses (Diabetes, Hypertension, Kidney Disease, Heart Disease, Liver Disease) and health-conscious individuals  
**Platform:** Android (Google Play) / iOS (App Store)  
**App Purpose:** Scan food via AI camera and instantly know if it is safe or risky for the user's specific health condition  
**Document Version:** 2.0 — Updated April 2026

---

## 1. App Identity & Color Theme

### Brand Name: NutriScan
**Tagline:** *"Scan your food. Protect your health."*

### Chosen Color Theme: Medical Teal + Warm White (Health Trust Palette)

This palette was selected for three reasons:
1. **Teal/Green** universally signals health, safety, and trust in medical contexts
2. **Warm white surfaces** feel approachable and clean — not cold or clinical like pure white hospital UIs
3. **Red/Amber/Green** traffic-light verdict colors are immediately understood by all users regardless of literacy level

### Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-primary` | `#00897B` (Medical Teal) | `#4DB6AC` | CTAs, active tabs, primary buttons |
| `--color-primary-light` | `#E0F2F1` | `#1A3C3A` | Tag backgrounds, pill highlights |
| `--color-bg` | `#F8FAF9` | `#121917` | App background |
| `--color-surface` | `#FFFFFF` | `#1C2422` | Cards, bottom sheets |
| `--color-surface-2` | `#F2F7F6` | `#243330` | Nested card backgrounds |
| `--color-text` | `#1A2B28` | `#DDF0ED` | Primary body text |
| `--color-text-muted` | `#6B8880` | `#7EABA4` | Subtitles, labels |
| `--color-safe` | `#2E7D32` | `#66BB6A` | Safe verdict color |
| `--color-caution` | `#E65100` | `#FFA726` | Caution/Limit verdict |
| `--color-avoid` | `#C62828` | `#EF5350` | Avoid/Danger verdict |
| `--color-divider` | `#E0EEEC` | `#2C3F3C` | Separator lines |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display / App name | **Plus Jakarta Sans** | 700–800 | 28–36px |
| Section headings | **Plus Jakarta Sans** | 600 | 18–22px |
| Body text | **Inter** | 400 | 16px |
| Labels / Badges | **Inter** | 500 | 12–14px |
| Buttons | **Plus Jakarta Sans** | 600 | 15px |

> **Rationale:** Plus Jakarta Sans is clean, modern, slightly rounded — approachable for health apps without looking overly playful. Inter is the most readable body font for dense health information on mobile.

---

## 2. Navigation Architecture

### Bottom Navigation Tabs (4 tabs — final)

```
[ 🏠 Home ]  [ 📷 Scan ]  [ 📋 History ]  [ 👤 Profile ]
```

- **Home** — Dashboard, daily health safety score, Scan CTA, today's log, health tip carousel
- **Scan** — Camera viewfinder (primary action of the app)
- **History** — Food log, date picker, weekly trends, health summary report
- **Profile** — User info, conditions, health goals, NutriBot chat history, settings

> **Note:** NutriGuide is NOT a separate navbar tab. Health tips and articles are surfaced as a carousel on the Home screen. Tapping a carousel card opens a full Article Detail screen with a back button and bottom nav still visible.

### Global Floating Elements

- **NutriBot FAB (Floating Action Button):** A teal circular chatbot button fixed to the bottom-right corner, visible on ALL screens except the full-screen camera viewfinder. This keeps the chatbot always accessible without occupying a navbar slot.
- FAB shows a small red badge notification when NutriBot has a new daily tip ready.

---

## 3. Complete Screen Inventory

### A. Authentication Screens

#### Screen A1: Splash Screen
- NutriScan logo (animated fade-in)
- Tagline: "Scan your food. Protect your health."
- Auto-advances to Onboarding (first launch) or Home (returning user)

#### Screen A2: Welcome / Login
- Logo + tagline at top
- Email + Password fields
- "Log In" primary button
- Social login: Google, Apple
- "Forgot Password?" link
- "New to NutriScan? Create an account" link
- "Continue as Guest" text link at bottom (low emphasis ghost style) — lets users try before committing

#### Screen A3: Sign Up
- Name, Email, Password fields
- Terms & Privacy agreement checkbox
- "Create Account" primary button
- "Already have an account? Log In" link

#### Screen A4: Forgot Password
- Email input
- "Send Reset Link" button

---

### B. Onboarding / 3-Tier Personalization Screens

#### Screen B1: Onboarding Welcome
- Illustration: person scanning food with phone
- Headline: "Let's personalize NutriScan for you"
- Sub: "Tell us about your health so we can guide your food choices"
- "Get Started" primary button + "Skip for now" ghost link

#### Screen B2: Illness Selector (Tier 1)
- Header: "Tell us about your health"
- Sub: "Select all that apply — you can update this anytime"
- Multi-select illness cards (tap to select, teal border when active):
  - 🩺 Diabetes / Prediabetes
  - 💓 Hypertension / High Blood Pressure
  - 🫀 Heart Disease / High Cholesterol
  - 🫘 Kidney Disease / Renal Diet
  - 🫁 Liver Disease / Hepatitis
  - 🏥 Cancer (on treatment)
  - ➕ My condition isn't listed / I'm not sure
- "Next →" primary button
- Step indicator: Step 1 of 3

#### Screen B3: Symptom / Dietary Tag Picker (Tier 2)
- **Shown when:** user tapped "My condition isn't listed" OR skipped Tier 1
- Header: "What are you trying to manage?"
- Sub: "Pick what your doctor recommended or what you want to improve"
- Multi-select pill/chip tags:
  - 🔴 Lower my sugar / avoid sweets
  - 🔵 Reduce salt and sodium
  - 🟡 Manage my weight
  - 🟠 Cut down on fatty foods
  - 🟣 Protect my kidneys
  - ⚪ Avoid processed / junk food
  - 🫀 Protect my heart
  - ✏️ My doctor said something else (opens text input)
- "Next →" button
- Step indicator: Step 2 of 3

#### Screen B4: NutriBot AI Assist Onboarding (Tier 3 — Optional)
- Header: "Not sure? Let NutriBot help"
- Sub: "Describe your health situation in your own words"
- Chat input field, placeholder: "e.g. My doctor said I have high blood pressure and should avoid salty food…"
- NutriBot response bubble: "Got it! I'll set your profile to watch for **high sodium** and **saturated fat**. Profile set to: Hypertension mode 🩺"
- "Looks good, save this!" primary button
- "I'll set up manually instead" ghost link
- Step indicator: Step 2 of 3

#### Screen B5: Profile Confirmation
- Header: "Your NutriScan profile is ready!"
- Summary card:
  - Conditions/tags selected (as teal pills)
  - Key nutrients NutriScan will monitor for them
  - Daily targets set (e.g., Sodium: < 1,500mg/day · Sugar: < 25g/day)
- "Start Scanning!" primary button
- Step indicator: Step 3 of 3

---

### C. Home Dashboard

#### Screen C1: Home (Main Dashboard)
- **Top bar:** NutriScan logo (left) + notification bell icon (right)
- **Greeting:** "Good morning, Jhepoy 👋"
- **Profile pills** (horizontal scroll, below greeting): `Diabetes` `Hypertension` — small teal chips
- **Today's Health Safety Card** (large, most prominent element):
  - Donut/ring chart showing % of safe scans today
  - Center text: e.g., "70% Safe" in teal
  - Below ring: breakdown pills → 🟢 3 Safe · 🟡 1 Caution · 🔴 1 Avoid
  - Sub: "Based on 5 scans today"
- **Primary CTA Button:** `📷 Scan Food` (large, full-width, teal)
- **Today's Log** section:
  - Header: "Today's Log" + "View All →" link (goes to History tab)
  - Max 3 rows visible:
    - Food thumbnail + name + meal type + time + verdict chip
  - Example: Oatmeal · Breakfast · 08:30 AM → `Safe`
  - Example: Fried Chicken · Lunch · 1:45 PM → `Avoid`
- **Health Tips Carousel** section:
  - Section header: "Health Tips For You" + "See more →" (scrolls through all cached articles)
  - Horizontally scrollable cards (each ~160×200px):
    - Thumbnail image (from Wikipedia API or cached image)
    - Small category tag pill: e.g., `Diabetes` · `Hypertension`
    - Short article title (2 lines max)
    - "X min read" label
  - Cards are filtered by user's illness profile
  - Tapping any card → navigates to Article Detail screen (Screen C3)
  - Content fetched from Wikipedia API, cached for 7 days, refreshed weekly

#### Screen C2: Home (Empty State — First Time User)
- Same greeting + profile pills
- Ring area shows illustrated empty plate: "No scans yet today"
- Sub: "Scan your first meal to see your health safety score"
- Large Scan button (same)
- Health Tips Carousel still visible (always shown regardless of scan count)

#### Screen C3: Article Detail Screen
- **Top bar:** Back arrow (←) left + article title truncated + bookmark icon right
- **Bottom nav still visible** (user does not lose navigation context)
- **Full-width header image** (from Wikipedia thumbnail or cached image)
- **Category tag pill** + **"X min read"** + date fetched
- **Article title** (H1, large, Plus Jakarta Sans bold)
- **Source credit:** "Source: Wikipedia · [Article Name]" (small muted text)
- **Body content:** Single-column paragraphs, 16px Inter, clean line spacing
- **Key Takeaways box** (teal-tinted card near end):
  - "📌 Key Takeaways"
  - 3 bullet point summary (AI-generated from article content via Gemini)
- **Related Tips** section at bottom: 2–3 more carousel cards to continue reading
- **Share button** at very bottom (share article link)

---

### D. Scan Flow

#### Screen D1: Scan Hub / Camera Viewfinder
- Full-screen camera preview
- Overlay frame guide: rounded rectangle with pulsing corner indicators
- Instruction text: "Center your food to scan"
- **Mode toggle (top center):** `📷 Photo` | `📱 Barcode` — segmented control
- **Capture button:** large white circle at bottom center
- **"Search manually"** small text link below capture button
- Small **"×"** close icon top-left to return to previous screen
- **NutriBot FAB is hidden on this screen only**

#### Screen D2: Preview & Confirm
- Captured image shown full-width (top ~60% of screen)
- Bottom sheet slides up with:
  - Loading skeleton shimmer while AI processes
  - After detection: Auto-detected food name (editable text field)
  - "Does this look right?" label
  - "Retake" ghost button + "Analyze" primary teal button

#### Screen D3: Scan Result Screen ⭐ (Most Important Screen)
- **Food image** (full-width, captured photo)
- **Food name** large title: e.g., "Fried Chicken"
- Meal type + time stamp: "Lunch · 1:45 PM"
- **Verdict Badge** (large, centered, most prominent):
  - 🔴 `⚠ AVOID` — red pill
  - 🟡 `⚡ USE WITH CAUTION` — amber pill
  - 🟢 `✓ SAFE` — green pill
- **Illness Alert Card** (shown for non-safe verdicts only):
  - Red or amber tinted background card
  - Icon + "High sodium — risky for your Kidney Disease"
  - "Learn why →" link → opens Article Detail screen with a relevant cached article
- **Energy Level** (secondary, small): "450 kcal per serving"
- **Nutritional Breakdown** (condition-focused, not generic):
  - Shows only 3–4 nutrients most relevant to user's illness profile
  - Each row: nutrient name + colored progress bar + value
  - For Kidney Disease: Sodium 🔴 800mg · Potassium 🟡 420mg · Protein 🟢 15g
  - "See full nutrition facts" expandable toggle at bottom
- **Better Alternatives** section (shown for Caution and Avoid verdicts):
  - Header: "Healthier Swaps For You"
  - Horizontal scrollable cards: food image + name + reason tag ("Lower Sodium", "High Fiber")
- **Action buttons:**
  - `Add to Food Log` — primary teal full-width button
  - `Scan Another` — ghost/outline button below

#### Screen D3b: Scan Result (Safe Variant)
- Same layout as D3 but:
  - Green `✓ SAFE` badge
  - No Illness Alert Card
  - No Better Alternatives section
  - Encouraging message: "Great choice for your health profile! 🎉"

#### Screen D4: Manual Food Search
- Search bar (auto-focused, keyboard open on arrival)
- Recent searches list below
- Search results: food name + serving size + tap to get verdict (goes to D3)

---

### E. History Tab

#### Screen E1: History Home
- **Top bar:** "History" title + filter/sort icon
- **Date selector:** horizontal scrollable day pills (Mon 20 · Tue 21 · **Thu 23**) — active day teal
- **Daily Summary Card:**
  - Health safety ring (same style as Home, for selected day)
  - Key nutrient totals vs. daily limits (condition-based)
  - Calorie summary: "Goal: 2,000 kcal · Consumed: 1,450 kcal · Remaining: 550 kcal"
- **Scans List** for selected day:
  - Each row: food thumbnail + name + time + verdict chip + kcal
  - Tap any row → reopens Scan Result screen (D3) for that item
- **Weekly Trend Chart:**
  - Bar chart per day of week
  - Stacked bars: Safe (green) / Caution (amber) / Avoid (red) scan counts
  - Shows if eating habits are improving over the week
- **"View Full Report"** button at bottom → goes to Screen E2

#### Screen E2: Health Summary Report
- **Header:** "Health Summary — Last 7 Days"
- User name + condition tag pills
- **Compliance Breakdown** (ring/donut chart):
  - Safe 70% · Caution 20% · Avoid 10%
- **Energy Trend** (line chart): Daily calorie intake vs. goal line across 7 days
- **Frequent Risky Foods** list:
  - Top 3 foods flagged red/amber this week
  - Each with condition-specific warning tag: `HIGH SODIUM` · `HIGH SUGAR`
- **Nutrient Focus** (condition-based weekly average):
  - e.g., "Avg daily sodium this week: 1,800mg vs. your 1,500mg limit"
  - Shown as a simple horizontal progress bar (red if over limit)
- **"Share as Image"** button — exports summary as a shareable graphic
- **"Export CSV"** button (v1.1 feature, shown grayed out in v1.0 with "Coming Soon" tag)

---

### F. NutriBot Chatbot

#### Screen F1: NutriBot Chat (Full Screen)
- **Accessed via:** Floating teal FAB button on all screens (except camera viewfinder)
- **Top bar:**
  - "NutriBot 🤖" title (left)
  - Condition context pills: `Diabetes` `Hypertension` (center, small)
  - Chat History icon (clock icon, right) → goes to Screen F2
  - "×" close button (far right)
- **Chat area (scrollable):**
  - NutriBot greeting on first open:
    > "Hi Jhepoy! 👋 I'm NutriBot, your personal nutrition assistant. I know you're managing **Diabetes** and **Hypertension**. What can I help you with today?"
  - User bubbles: right-aligned, teal background, white text
  - NutriBot bubbles: left-aligned, white/surface card, dark text, small NutriBot avatar icon
  - Timestamps shown per message group
- **Quick Suggestion Chips** (shown after NutriBot messages, contextual):
  - "Is [food] safe for me?"
  - "What should I eat for breakfast?"
  - "Explain my last scan"
  - "What foods are high in sodium?"
  - "Give me a healthy meal idea"
- **Input bar (bottom, above FAB):**
  - Text field: "Ask NutriBot anything…"
  - Send button (teal arrow icon)
- **Context-aware behavior:**
  - NutriBot receives user's illness profile as system context
  - NutriBot can reference recent scan history
  - NutriBot recommends articles: "I found a helpful tip — want to read it?" → tapping opens Article Detail (C3)
  - NutriBot never diagnoses or prescribes medication
  - Always appends soft disclaimer for medical questions: "For serious concerns, please consult your doctor. 🩺"

#### NutriBot Sample Conversations

| User Input | NutriBot Response |
|-----------|------------------|
| "Can I eat white rice?" | "For Diabetes, white rice can spike blood sugar quickly 🍚. A smaller portion (½ cup) is safer. Better swap: brown rice or cauliflower rice. Want meal ideas?" |
| "Good breakfast for high blood pressure?" | "For Hypertension, try: 🥣 Plain oatmeal, 🍌 Banana (high potassium!), or 🥚 Boiled eggs. Avoid instant oatmeal packets — often high in sodium!" |
| "Explain my last scan" | "Your last scan was Fried Chicken 🍗 — flagged AVOID because it had 800mg sodium. That's 53% of your 1,500mg daily limit for Hypertension in one meal." |
| "What can I eat for merienda?" | "Safe merienda ideas for your profile: 🍎 Apple slices, 🥜 Unsalted nuts (small handful), or 🫙 Plain low-fat yogurt. All low in sodium and sugar!" |

#### Screen F2: Chat History
- **Accessed via:** Clock icon inside NutriBot chat (F1) OR Profile tab (H1)
- **Top bar:** "Chat History" title + back arrow
- Conversations grouped by date:
  - Date header: "Today", "Yesterday", "April 15", etc.
  - Each conversation row: first message preview + timestamp + arrow
  - Tap any row → reopens that full conversation in F1 (read-only or continuable)
- **"New Chat"** button at top right — starts a fresh conversation
- **Empty state:** "No conversations yet. Tap the NutriBot button to start chatting! 🤖"

#### NutriBot FAB (Floating Button — Global)
- Fixed position: bottom-right, 56×56px diameter teal circle
- Icon: chat bubble with a small leaf/heart inside
- Small red notification badge when a new daily tip is available
- Hidden on: Screen D1 (camera viewfinder) only
- Smooth entrance animation on each screen (scale up from 0 with spring easing)

---

### G. Profile Tab

#### Screen G1: Profile Home
- **Top bar:** "Profile" title + settings gear icon (right) → goes to G2
- Profile image (circular) + name + "Active" green badge
- Condition tag pills: `Diabetes` `Hypertension`
- **Health Goals card:**
  - Condition-specific daily limits:
    - Sodium max: 1,500mg
    - Sugar max: 25g
    - Calories: 2,000 kcal
  - "Edit Goals" button → opens edit screen
- **Personal Info section:**
  - Age, Height/Weight (optional), Blood Type
  - "Edit Profile" button
- **Stats row** (small cards in a row):
  - Total Scans · Safe % this week · Days active streak
- **NutriBot section:**
  - Header: "NutriBot" with small robot icon
  - Row: "Chat History 🕐" → goes to Screen F2
  - Row: "Clear Chat History" → confirmation dialog
- **App Settings shortcut row:**
  - Dark Mode toggle (directly accessible here)
  - Language selector
  - "Full Settings →" link → goes to G2

#### Screen G2: Settings
- **Account Settings:**
  - Personal Information
  - Edit Health Conditions (re-opens onboarding B2 flow)
  - Change Password
  - Linked Accounts (Google, Apple)
- **Notification Preferences:**
  - Meal reminders toggle
  - Daily NutriTip notification toggle
  - Alert sounds toggle
- **NutriBot Settings:**
  - Show quick suggestion chips toggle
  - NutriBot notification alerts toggle
- **Privacy & Data:**
  - Anonymous analytics toggle
  - "Export My Data" (CSV — v1.1)
- **App Settings:**
  - Language (English / Filipino)
  - Dark Mode toggle
- **Support & Feedback:**
  - Help Center
  - Send Feedback
  - Rate the App
- **Legal:**
  - Terms of Service
  - Privacy Policy
  - Medical Disclaimer
- **Logout** (bottom, red destructive text)
- App version: "NutriScan v1.0.0"

---

## 4. Complete App Flow Diagram

```
LAUNCH
  │
  ├─► [First Time] ──► Splash → Login/Sign Up → Onboarding (B1→B5) → Home
  └─► [Returning]  ──► Splash → Login → Home
                                    │
               ┌────────────────────┼──────────────────┬─────────────────┐
               ▼                    ▼                  ▼                 ▼
            HOME                  SCAN             HISTORY           PROFILE
               │                    │                  │                 │
    Safety Score Ring        Viewfinder (D1)     Date Picker        User Info
    Scan CTA Button     →    Preview (D2)    →   Scans List         Health Goals
    Today's Log         →    Result (D3)         Weekly Chart       NutriBot →──┐
    Health Tip Carousel      Manual Search       Full Report        Settings    │
         │                                                                       │
         ▼                                                                       ▼
    Article Detail (C3)                                              Chat History (F2)
    [Back → Home]                                                         │
                                                                          ▼
                                                    ┌──────────── NutriBot Chat (F1) ◄──── FAB (all screens)
                                                    │             Ask questions
                                                    │             Food safety checks
                                                    │             Scan explanations
                                                    │             Meal suggestions
                                                    └─────────────────────────────────────
```

---

## 5. Health Tips Carousel — Technical Implementation

### How the carousel content works

| Layer | Content Type | Source | Refresh |
|-------|-------------|--------|---------|
| "For You" cards | Condition-specific article summaries | Wikipedia REST API | Every 7 days |
| Daily tip text | 1–2 sentence health tip | Gemini Free API | Every 24 hours |
| Article detail body | Full article text + image | Wikipedia REST API (cached) | Every 7 days |
| Key Takeaways box | 3-bullet summary | Gemini AI (generated once per article) | On cache refresh |

### Wikipedia API call example

```
GET https://en.wikipedia.org/api/rest_v1/page/summary/Diabetic_diet
Returns: title, extract (summary paragraph), thumbnail.source (image URL)
```

### Condition-to-article mapping (pre-defined in your code)

| Condition | Wikipedia slugs to fetch |
|-----------|------------------------|
| Diabetes | `Diabetic_diet`, `Glycemic_index`, `Blood_sugar`, `Low-carbohydrate_diet` |
| Hypertension | `Hypertension`, `DASH_diet`, `Sodium_in_diet` |
| Kidney Disease | `Renal_diet`, `Potassium`, `Phosphorus_in_biology` |
| Heart Disease | `Saturated_fat`, `Mediterranean_diet`, `Omega-3_fatty_acid` |
| Liver Disease | `Hepatic_diet`, `Cirrhosis`, `Fatty_liver_disease` |
| General | `Nutrition_facts_label`, `Ultra-processed_food`, `Food_safety` |

### Caching strategy
1. First app launch → fetch all articles for user's conditions → store in local DB (Firebase/Supabase)
2. On every app open → check if cache age > 7 days → if yes, re-fetch; if no, load from cache
3. This means: content looks consistent day-to-day, updates weekly, works offline after first load

---

## 6. NutriBot Chatbot Architecture

### System Prompt Sent to AI API

```
You are NutriBot, a friendly nutrition assistant inside the NutriScan app.

User profile:
  Name: [user name]
  Conditions: [Diabetes, Hypertension, etc.]
  Daily nutrient limits: Sodium < 1500mg, Sugar < 25g, Calories < 2000 kcal
  Recent scans: [last 5 scans with verdicts and key nutrients]

Your role:
  - Answer food safety questions specific to the user's conditions
  - Explain scan results in simple, friendly language
  - Suggest healthier food alternatives when asked
  - Recommend reading a health tip when relevant
  - Keep responses short: max 3 sentences or 3 bullet points
  - Be warm, encouraging, and supportive — never alarming
  - Never diagnose illness or prescribe medication
  - For serious medical questions, always add: "Please consult your doctor for this. 🩺"
  - Use simple English and occasional Filipino food references when relevant
```

### Suggested AI Backend Options

| Option | Best For | Cost |
|--------|----------|------|
| OpenAI GPT-4o Mini | Best accuracy, reliable | Low (pay per use) |
| Google Gemini 1.5 Flash | Fast, free tier available | Free tier (60 req/min) |
| Groq + LLaMA 3 | Fastest response time | Free / Open source |

> **Recommendation for student MVP:** Use **Gemini 1.5 Flash** — it has a free tier generous enough for a prototype and demo, integrates easily with Flutter/React Native, and handles Filipino food context well.

### Chat History Storage
- Each conversation saved to user's Firestore/Supabase record
- Structure: `{ conversation_id, user_id, messages: [{role, content, timestamp}], created_at }`
- Displayed in Screen F2 grouped by date, each expandable
- New conversation started when user taps "New Chat" in F2 or after 24 hours of inactivity

---

## 7. Feature Priority Matrix

| Feature | Priority | Phase |
|---------|----------|-------|
| Photo food scan + AI verdict | 🔴 Must Have | MVP v1.0 |
| Barcode scan | 🔴 Must Have | MVP v1.0 |
| 3-Tier illness personalization onboarding | 🔴 Must Have | MVP v1.0 |
| Scan result with condition-based alerts | 🔴 Must Have | MVP v1.0 |
| Better alternatives on result screen | 🔴 Must Have | MVP v1.0 |
| Food log / History | 🔴 Must Have | MVP v1.0 |
| NutriBot chatbot (text-based) | 🔴 Must Have | MVP v1.0 |
| NutriBot chat history | 🔴 Must Have | MVP v1.0 |
| Health Tips Carousel on Home (Wikipedia API) | 🔴 Must Have | MVP v1.0 |
| Article Detail screen | 🔴 Must Have | MVP v1.0 |
| Weekly health summary report | 🟡 Should Have | MVP v1.0 |
| Profile tab with health goals | 🟡 Should Have | MVP v1.0 |
| Dark mode | 🟡 Should Have | MVP v1.0 |
| Manual food search | 🟡 Should Have | MVP v1.0 |
| AI-generated Key Takeaways in articles | 🟡 Should Have | MVP v1.0 |
| Daily push notification tips | 🟢 Nice to Have | v1.1 |
| Voice input for NutriBot | 🟢 Nice to Have | v1.1 |
| Export logs as CSV/PDF | 🟢 Nice to Have | v1.1 |
| NutriBot scan from chat (image in chat) | 🟢 Nice to Have | v1.1 |
| Doctor/family member report sharing | 🟢 Nice to Have | v2.0 |
| Meal planning feature | 🟢 Nice to Have | v2.0 |
| Recipe suggestions based on conditions | 🟢 Nice to Have | v2.0 |
| Wearable / fitness tracker integration | 🟢 Nice to Have | v2.0 |

---

## 8. Final Figma Screen Checklist

### Authentication (3 screens)
- [ ] A2: Login screen
- [ ] A3: Sign Up screen
- [ ] A4: Forgot Password

### Onboarding (5 screens)
- [ ] B1: Onboarding welcome
- [ ] B2: Illness selector (multi-select)
- [ ] B3: Symptom / dietary tag picker
- [ ] B4: NutriBot AI assist onboarding (Tier 3)
- [ ] B5: Profile confirmation summary

### Home (3 screens)
- [ ] C1: Home dashboard (with data + health tip carousel)
- [ ] C2: Home empty state (first time user)
- [ ] C3: Article Detail screen (opened from carousel)

### Scan (4 screens)
- [ ] D1: Camera viewfinder
- [ ] D2: Preview & confirm
- [ ] D3: Scan result — Avoid example
- [ ] D3b: Scan result — Safe example
- [ ] D4: Manual food search

### History (2 screens)
- [ ] E1: History home / food log
- [ ] E2: Health summary report

### NutriBot (2 screens)
- [ ] F1: NutriBot full-screen chat
- [ ] F2: Chat history list

### Profile (2 screens)
- [ ] G1: Profile home (with NutriBot history shortcut)
- [ ] G2: Settings

**Total: ~21 core screens**

---

## 9. Key UX Principles for NutriScan

### Principle 1: Sick Users First
- Minimum 16px body text throughout (accessibility for older/sick users)
- Touch targets minimum 48×48px
- Plain language only — no medical jargon without a plain-language explanation
- Always contextualize numbers: "800mg sodium" → "800mg — 53% of your daily limit"

### Principle 2: Speed Above All
- Core flow: App open → Scan → Verdict = 3 taps maximum, under 10 seconds
- Scan result loads within 3 seconds of capture
- NutriBot responds within 2 seconds (streaming preferred)
- Health tip carousel loads from cache instantly on Home (no loading state needed after first load)

### Principle 3: Personalization Is Always Visible
- Condition pills visible on Home greeting, Scan result, and NutriBot chat header
- Every flag and verdict references the user's specific condition by name
- Health tip carousel always filtered by the user's conditions — "For You" not generic

### Principle 4: Trust Through Transparency
- Always show *why* a food is flagged (not just the red badge)
- Medical disclaimer visible in Settings and on first scan result
- Wikipedia source credited on every article card
- NutriBot defers to doctors for serious medical questions

### Principle 5: Engagement Loop
- Home → Health Tip Carousel → Article Detail → "Related Tips" → back to Home
- Scan result → "Learn why →" → Article Detail → back to result
- NutriBot tip notification → opens chat → answers question → suggests article → user reads, returns
- History → "View Full Report" → shares with family/doctor → reinforces app value

---

## 10. Medical Disclaimer (Required in App)

> *NutriScan provides nutritional guidance based on publicly available dietary standards and is intended for general educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or a registered dietitian before making significant changes to your diet, especially if you have a medical condition. Nutrient thresholds used in this app are based on guidelines from the World Health Organization (WHO) and the Philippine Department of Health (DOH).*

---

*Document prepared for NutriScan Technopreneurship Project*  
*App Version: 1.0 (MVP Planning)*  
*Document Version: 2.0*  
*Last Updated: April 2026*
