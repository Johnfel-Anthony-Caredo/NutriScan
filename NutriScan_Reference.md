# NutriScan — Complete Technical Reference
> **Version:** 1.0 (Live Build) · **Last Updated:** May 2026 · **Platform:** React Native + Expo (Android / iOS)

---

## 1. App Overview & Identity

**Name:** NutriScan  
**Tagline:** *"Scan your food. Protect your health."*  

### Explanation
NutriScan is a smart health-tech mobile application designed to bridge the gap between complex dietary restrictions and everyday food choices. By leveraging artificial intelligence and comprehensive nutritional data, it translates medical dietary guidelines into clear, actionable advice for the user at the point of decision (e.g., in the grocery aisle or before eating a meal).

### Purpose
The primary purpose of NutriScan is to empower individuals, particularly those managing chronic illnesses, to make safe, informed, and confident dietary choices without needing to manually decipher complex nutrition labels or perform mental math against their daily limits.

### Goal
To build a highly personalized, easy-to-use digital companion that reduces the anxiety and cognitive load associated with managing a diet-dependent health condition, ultimately improving long-term health outcomes and dietary compliance.

### Objectives
- **Instant Analysis:** Provide real-time, personalized food safety evaluations (Safe / Caution / Avoid) under 10 seconds.
- **Deep Personalization:** Tailor every scan result to the user's specific medical profile, including interconnected conditions like diabetes, hypertension, and kidney disease.
- **Education & Support:** Offer contextual explanations of *why* a food is flagged, backed by accessible health tips and an intelligent chatbot (NutriBot).
- **Behavioral Tracking:** Track dietary compliance over time through visual dashboards, weekly charts, and health reports.

### Core Features
- **Triple-Mode Scanning:** Identify foods using the AI-powered camera (photo scan), barcode scanner, or manual text search.
- **Personalized Verdicts:** AI-driven analysis that compares food nutrients against the user's customized daily limits.
- **Smart Alternatives:** Context-aware suggestions for healthier food swaps when a scanned item is flagged as risky.
- **NutriBot Assistant:** An AI chatbot with full context of the user's health profile, available 24/7 for dietary advice and meal planning.
- **History & Reporting:** Daily scan logs, weekly compliance charts, and actionable health summary reports.
- **Condition-Specific Health Tips:** A curated carousel of health articles sourced from Wikipedia, dynamically filtered to match the user's illnesses.

**Target Users:** People managing chronic conditions (Diabetes, Hypertension, Kidney Disease, Heart Disease, Liver Disease, Cancer) and health-conscious individuals.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81.5 + Expo ~54 |
| Routing | Expo Router ~6 (file-based, Stack + Tabs) |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions, Storage) |
| AI — Scan | Google `gemma-4-31b-it` (temp 0.2, precise JSON) |
| AI — Chat | Google `gemini-2.5-flash` (temp 0.7, conversational) |
| External API | Open Food Facts (barcode lookup + food search) |
| State | React Context (`AuthContext` + `ProfileContext` with `useReducer`) |
| Offline Cache | AsyncStorage (`@nutriscan/profile`) |
| Image | `expo-image-manipulator` + `expo-file-system/legacy` |
| Animations | `react-native-reanimated` ~4 |
| Chat Rendering | `react-native-markdown-display` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Fonts | Space Grotesk (headings) + DM Sans (body) via `expo-font` |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Expo Router                          │
│   Stack: Landing → Auth → Onboarding → Tabs + Modals   │
├───────────────────┬─────────────────────────────────────┤
│  AuthContext      │  ProfileContext (useReducer)         │
│  session, user    │  conditions, goals, targets          │
│  signOut()        │  AsyncStorage + Supabase sync        │
├───────────────────┴─────────────────────────────────────┤
│                    Services Layer                       │
│  scanService · supabaseService · articleService         │
│  authService · storageService                           │
├─────────────────────────────────────────────────────────┤
│                 Supabase Backend                        │
│  Auth │ PostgreSQL │ Edge Functions │ Storage           │
│       │            │  scan-ai       │                   │
│       │            │  nutribot      │                   │
│       │            │  articles-fetch│                   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Directory Structure

```
nutriscan/
├── app/
│   ├── _layout.tsx              # Root layout + route guards
│   ├── index.tsx                # Landing screen (hero splash)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── auth/callback.tsx        # OAuth deep-link handler
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── conditions.tsx
│   │   ├── nutribot-assist.tsx
│   │   ├── goals.tsx
│   │   └── confirmation.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar + FloatingNutriBotButton
│   │   ├── index.tsx            # Home dashboard
│   │   ├── scan.tsx             # Camera viewfinder
│   │   ├── history.tsx          # Scan log + weekly chart
│   │   └── profile.tsx          # User profile + settings
│   ├── scan-preview.tsx         # Photo capture → AI result
│   ├── scan-result.tsx          # Verdict detail + log action
│   ├── manual-search.tsx        # Open Food Facts search
│   ├── nutribot.tsx             # AI chat assistant
│   ├── chat-history.tsx         # Conversation list
│   ├── health-report.tsx        # Weekly summary report
│   ├── edit-profile.tsx         # Edit personal metrics
│   └── article/[id].tsx         # Wikipedia article viewer
├── components/ui/               # 23 reusable UI components
├── constants/theme/             # Design tokens (7 files)
├── context/                     # AuthContext + ProfileContext
├── services/                    # 5 service files
├── supabase/functions/          # 3 Edge Functions
├── types/                       # health.ts, articles.ts, products.ts, navigation.ts
├── utils/                       # optimizeImage.ts
├── data/                        # mockData.ts (ScanResultData type)
├── lib/                         # supabase.ts (client init)
└── hooks/                       # useTheme.ts
```

---

## 5. Screen Inventory

| # | Screen | Path | Presentation |
|---|---|---|---|
| 1 | Landing | `app/index.tsx` | Default |
| 2 | Login | `app/(auth)/login.tsx` | Default |
| 3 | Register | `app/(auth)/register.tsx` | Default |
| 4 | Auth Callback | `app/auth/callback.tsx` | Fade |
| 5 | Welcome | `app/(onboarding)/welcome.tsx` | Default |
| 6 | Conditions | `app/(onboarding)/conditions.tsx` | Default |
| 7 | NutriBot Assist | `app/(onboarding)/nutribot-assist.tsx` | Default |
| 8 | Goals | `app/(onboarding)/goals.tsx` | Default |
| 9 | Confirmation | `app/(onboarding)/confirmation.tsx` | Default |
| 10 | Home | `app/(tabs)/index.tsx` | Tab |
| 11 | Scan | `app/(tabs)/scan.tsx` | Tab |
| 12 | History | `app/(tabs)/history.tsx` | Tab |
| 13 | Profile | `app/(tabs)/profile.tsx` | Tab |
| 14 | Scan Preview | `app/scan-preview.tsx` | Slide from right |
| 15 | Scan Result | `app/scan-result.tsx` | Slide from right |
| 16 | Manual Search | `app/manual-search.tsx` | Modal (bottom) |
| 17 | NutriBot | `app/nutribot.tsx` | Modal (bottom) |
| 18 | Chat History | `app/chat-history.tsx` | Slide from right |
| 19 | Health Report | `app/health-report.tsx` | Slide from right |
| 20 | Edit Profile | `app/edit-profile.tsx` | Default |
| 21 | Article Detail | `app/article/[id].tsx` | Modal (bottom) |

---

## 6. Route Guards (`app/_layout.tsx`)

`RootLayoutNav` enforces navigation after both `authLoading` and `profileHydrated` resolve:

| State | Destination |
|---|---|
| No session, not on landing/auth | `/` (landing) |
| Session + onboarding incomplete | `/(onboarding)/welcome` |
| Session + onboarding complete + on auth/landing | `/(tabs)` |
| Session + onboarding complete + in tabs | Stay |

---

## 7. Three Scan Modes

### 7.1 Photo Scan
1. Camera captures photo in `scan.tsx`
2. Routes to `scan-preview.tsx` with `imageUri`
3. `optimizeImage(uri)` → resize 1200px max, compress 0.6, convert to base64
4. `analyzeFoodPhoto()` → POST to `scan-ai` Edge Function with base64 image + user profile
5. Result renders inline in `scan-preview.tsx` bottom panel

### 7.2 Barcode Scan
1. Barcode scanner reads code in `scan.tsx`
2. `lookupBarcode(code)` → Open Food Facts API (`/api/v2/product/{barcode}.json`)
3. `analyzeBarcodeWithAi(barcodeData, userProfile)` → POST to `scan-ai` Edge Function (no image)
4. Result renders in `scan-preview.tsx`

### 7.3 Manual Search
1. User opens `manual-search.tsx` (modal)
2. `searchProducts(query)` → Open Food Facts search API
3. User taps a product → routed to `scan-preview.tsx` or `scan-result.tsx`
4. `analyzeTextFood(foodName, userProfile)` → POST to `scan-ai` with text only

---

## 8. Scan Result Display

After AI analysis, results render inline in `scan-preview.tsx` as a bottom panel:

| Field | Display |
|---|---|
| `confidence ≥ 0.80` | 🟢 Green badge: "Identified" |
| `confidence ≥ 0.50` | 🟡 Amber badge: "{XX}% confident" |
| `confidence < 0.50` | 🔴 Red badge |
| `portionGuidance` | Italic note with 🍽 plate icon in explanation card |
| `verdict` | Large color-coded badge (Safe / Caution / Avoid) |
| `nutrients[]` | Condition-relevant nutrient rows with progress bars |
| `alternatives[]` | Horizontal scrollable "Healthier Swaps" cards |
| `reasoningSummary[]` | Bullet list explanation |

---

## 9. Edge Functions

### `scan-ai` (`supabase/functions/scan-ai/index.ts`)
- **Model:** `gemma-4-31b-it` · Temperature 0.2
- **Auth:** Verifies JWT from `Authorization: Bearer` header
- **Input:** `{ image?: { base64, mimeType }, barcodeData?: { productName, nutrients, servingSize }, userProfile }`
- **Process:** Builds system prompt with user's conditions + goals + nutrient targets → sends to Gemini → strips markdown fences → `JSON.parse()`
- **Output:**
```typescript
{
  confidence: number;        // 0–1 certainty of food identification
  foodName: string;
  verdict: 'safe' | 'caution' | 'avoid';
  explanation: string;
  safeMessage?: string;
  reasoningSummary: string[];
  alternatives: { name: string; verdict: Verdict }[];
  nutrients: NutrientInfo[];
  portionGuidance?: string;  // e.g. "Best in small portions"
}
```

### `nutribot` (`supabase/functions/nutribot/index.ts`)
- **Model:** `gemini-2.5-flash` · Temperature 0.7
- **Auth:** JWT verification
- **Input:** `{ messages: [{role, content}][], profile }`
- **Output:** `{ reply: string }` (markdown-formatted)
- **System prompt rules:** Personalized to user's conditions, no medical diagnosis, empathetic tone, defers serious questions to doctors

### `articles-fetch` (`supabase/functions/articles-fetch/index.ts`)
- **Auth:** JWT verification
- **Input:** `{ slugs: string[] }` (Wikipedia article slugs)
- **Process:** Fetches each slug from Wikipedia REST API `/page/summary/{slug}` → infers category → extracts takeaways → resolves related slugs
- **Output:** `{ articles: Article[] }` with slug, title, category, summary, content, imageUrl, sourceUrl, keyTakeaways, relatedSlugs

---

## 10. Database Schema

| Table | Key Columns | Purpose |
|---|---|---|
| `user_profiles` | id, name, age, height_cm, weight_kg, blood_type, goals[], onboarding_completed, nutribot_note, custom_condition, condition_source, ai_suggested_condition | User profile + onboarding state |
| `user_conditions` | user_id, condition | Health conditions (one row per condition) |
| `user_nutrient_targets` | user_id, nutrient, daily_limit, unit | Monitored nutrients with daily limits |
| `scan_logs` | user_id, food_name, meal_type, verdict, reason, image_url, source, nutrients, alternatives, portion_guidance, scanned_at | Food scan history |
| `chat_conversations` | user_id, title, created_at, updated_at | NutriBot conversation metadata |
| `chat_messages` | conversation_id, role, content, created_at | Individual messages |
| `article_cache` | slug, title, category, summary, content, image_url, source_url, key_takeaways, related_slugs, fetched_at | Cached Wikipedia articles |

> **Note:** `scan_logs.portion_guidance` column was added May 2026. `confidence` is UI-only — not persisted.

---

## 11. Services Layer

### `scanService.ts`
| Function | Purpose |
|---|---|
| `lookupBarcode(barcode)` | Open Food Facts barcode lookup → `BarcodeProductData \| null` |
| `searchProducts(query)` | Open Food Facts search → `SearchProduct[]` |
| `analyzeFoodPhoto(base64, mime, profile, barcodeData?)` | POST image to `scan-ai` → `ScanAiResponse` (90s timeout) |
| `analyzeBarcodeWithAi(barcodeData, profile)` | POST barcode data to `scan-ai` → `ScanAiResponse` (45s timeout) |
| `analyzeTextFood(foodName, profile)` | POST food name to `scan-ai` → `ScanAiResponse` (45s timeout) |
| `buildScanResultFromAiResponse(ai, meal, source)` | Map AI response → `ScanResultData` |
| `buildScanResultFromBarcode(data, meal)` | Build result from barcode data (no AI) |
| `buildScanResultFromSearchProduct(product, meal)` | Build result from search product |

### `supabaseService.ts`
| Function | Purpose |
|---|---|
| `getUserProfile(userId)` | Fetch profile with conditions + targets |
| `updateUserProfile(userId, updates)` | Partial update (snake_case fields) |
| `upsertUserConditions(userId, conditions[])` | Delete-then-insert pattern |
| `upsertNutrientTargets(userId, targets[])` | Delete-then-insert pattern |
| `insertScanLog(userId, result, source, imageUrl?)` | Insert scan log row |
| `getTodaysScanLogs(userId)` | Today's scans, newest first |
| `getWeeklyScanLogs(userId)` | Last 7 days scans |
| `getAllUserScans(userId)` | All scans (scanned_at + verdict only) |
| `getConversations(userId)` | Chat conversations newest first |
| `getMessages(conversationId)` | Messages chronologically |
| `createConversation(userId, firstMessage)` | New conversation (title = first 30 chars) |
| `insertMessage(conversationId, role, content)` | Insert message + update conversation timestamp |
| `getCachedArticles(condition?)` | Fetch article cache, optionally filtered |
| `getArticleBySlug(slug)` | Single article by slug |
| `upsertArticleCache(articles[])` | Upsert on conflict = slug |

### `articleService.ts`
Handles article refresh logic — checks cache age, fetches from `articles-fetch` Edge Function, and stores to Supabase.

### `authService.ts`
Thin wrapper over `supabase.auth` for `signIn`, `signUp`, `signOut`.

### `storageService.ts`
- `uploadScanImage(uri, userId)` → uploads to Supabase Storage bucket, returns public URL

---

## 12. Context Providers

### `AuthContext` (`context/AuthContext.tsx`)
```typescript
State:  { session, user, isLoading }
Action: signOut()
Init:   supabase.auth.getSession() → listen onAuthStateChange()
```

### `ProfileContext` (`context/ProfileContext.tsx`)
```typescript
State:  { profile: UserHealthProfile, isLoading, isHydrated, hydrationError }
```

**Hydration priority:** Supabase → AsyncStorage (`@nutriscan/profile`) → `DEFAULT_PROFILE`

**Actions:**
| Action | Effect |
|---|---|
| `setPrimaryCondition(c)` | Sets condition + rebuilds nutrient targets + syncs |
| `setConditions(c[])` | Replaces all conditions + rebuilds targets |
| `setGoals(g[])` | Updates dietary goals |
| `setNutriBotNote(note)` | Saves AI onboarding note |
| `completeOnboarding()` | Marks done + bulk syncs all data |
| `updateProfile(fields)` | Partial camelCase → snake_case update |
| `resetProfile()` | Clears local state + AsyncStorage (preserves remote) |

Every state change after hydration → persisted to AsyncStorage + fire-and-forget Supabase sync.

---

## 13. Type System (`types/health.ts`)

```typescript
type HealthCondition =
  'diabetes' | 'hypertension' | 'heart_disease' |
  'kidney_disease' | 'liver_disease' | 'cancer' | 'other' | 'unsure';

type Verdict = 'safe' | 'caution' | 'avoid';

type HealthGoal =
  'lower_sugar' | 'reduce_sodium' | 'manage_weight' | 'cut_fat' |
  'protect_kidneys' | 'avoid_processed' | 'protect_heart' | 'doctor_other';

type MonitoredNutrient =
  'sugar' | 'sodium' | 'calories' | 'saturated_fat' | 'cholesterol' |
  'potassium' | 'phosphorus' | 'protein' | 'carbohydrates' | 'fiber';

interface NutrientTarget {
  nutrient: MonitoredNutrient;
  label: string;
  dailyLimit: number;
  unit: string;
}

interface UserHealthProfile {
  conditions: HealthCondition[];
  goals: HealthGoal[];
  nutrientTargets: NutrientTarget[];
  nutriBotNote?: string;
  onboardingCompleted: boolean;
  customCondition?: string;
  conditionSource?: 'listed' | 'other' | 'unsure_ai';
  aiSuggestedCondition?: HealthCondition;
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
}
```

**Condition → Nutrient Target mapping** is handled by `buildNutrientTargets(conditions[])`. Duplicate nutrients across conditions → most restrictive (lowest) daily limit wins.

---

## 14. Design System (`constants/theme/`)

### Philosophy
**Neo-Brutalist** — thick black borders (3px), bold typography, high-contrast light-only mode. No dark mode.

### Color Tokens (`colors.ts`)

| Token | Value | Usage |
|---|---|---|
| `primary` / `medicalTeal` | `#00897B` | CTAs, active tabs, primary buttons |
| `primaryLight` / `mintTint` | `#E0F2F1` | App background, tag highlights |
| `deepBlack` | `#0A0A0A` | All borders, shadows, primary text |
| `surface` | `#FFFFFF` | Cards, sheets |
| `safe.bg / text / border` | `#E8F8EE / #1B7A3D / #2E7D32` | Safe verdict tokens |
| `caution.bg / text / border` | `#FFF7E6 / #946200 / #FFD54F` | Caution verdict tokens |
| `avoid.bg / text / border` | `#FFF0EE / #C0392B / #FF6B57` | Avoid verdict tokens |

### Typography (`typography.ts`)

| Role | Font | Size |
|---|---|---|
| Headings / Labels | Space Grotesk | 12–40px |
| Body / Captions | DM Sans | 12–16px |

Text style presets: `displayXl`, `displayMd`, `h1`, `h2`, `h3`, `body`, `bodyMedium`, `caption`, `label`, `small`

### Spacing (`spacing.ts`)
`xs=4 · sm=8 · md=16 · lg=24 · xl=32 · 2xl=48` — Screen horizontal padding: 16px

### Shadows (`shadows.ts`)
Hard drop shadows (0 blur, deep black). iOS: `shadowRadius: 0`. Android: absolute positioned View trick.
- `sm`: 3px offset · `md`: 5px offset · `lg`: 8px offset

### Border Radius (`radius.ts`)
Defined constants for consistent corner rounding across components.

---

## 15. UI Components (`components/ui/`)

| Component | Purpose |
|---|---|
| `AppScreen` | Base screen wrapper with safe area + background |
| `Card` | Neo-brutalist card with hard shadow (View-based for Android) |
| `ChatBubble` | User/assistant chat message bubble with markdown |
| `ConditionPill` | Health condition tag chip |
| `EmptyState` | Illustrated empty state with icon + message |
| `FloatingNutriBotButton` | Fixed bottom-right teal FAB, hidden on camera |
| `FoodLogItem` | Scan log row: thumbnail + name + meal type + verdict chip |
| `NutriBotShimmer` | Skeleton shimmer while NutriBot responds |
| `NutrientRow` | Single nutrient: label + progress bar + value |
| `NutritionDashboard` | Home calorie ring + macro circular indicators |
| `PrimaryButton` | Full-width teal CTA button |
| `ProfileSummaryCard` | User name + avatar + condition pills + active badge |
| `ProgressBar` | Colored progress bar (used in NutrientRow) |
| `SecondaryButton` | Outline/ghost button |
| `SectionHeader` | Section title + optional "View All" link |
| `SelectableCard` | Tap-to-select card with active teal border |
| `SelectableChip` | Tap-to-select emoji pill chip |
| `SkeletonLoader` | Animated shimmer placeholder |
| `TopBar` | Screen header: back arrow + title + optional right action |
| `TypingIndicator` | Animated dots while NutriBot is thinking |
| `VerdictBadge` | Color-coded Safe/Caution/Avoid badge |
| `WeeklyChart` | Stacked bar chart for History tab weekly trends |

---

## 16. Onboarding Flow

```
welcome.tsx
    └─► conditions.tsx (select health condition)
            ├─► nutribot-assist.tsx  (if "I'm not sure" selected)
            └─► goals.tsx (dietary goals multi-select)
                    └─► confirmation.tsx (review + confirm)
                                └─► /(tabs) (app entry)
```

- **No skip allowed** — onboarding must be completed to enter the app
- `completeOnboarding()` bulk syncs all profile data to Supabase
- Route guard redirects back to `/(onboarding)/welcome` if `onboardingCompleted === false`

---

## 17. Chat Architecture (NutriBot)

```
User opens FAB
    └─► nutribot.tsx
            ├─ New chat: createConversation() in Supabase
            ├─ Existing: getMessages() loads history
            └─ Send message:
                    insertMessage('user', content)
                    → POST /functions/v1/nutribot { messages, profile }
                    → insertMessage('assistant', reply)
```

Chat history viewable in `chat-history.tsx` — grouped by date, each row shows first message preview + timestamp.

---

## 18. Article System

**Source:** Wikipedia REST API (`/api/rest_v1/page/summary/{slug}`)  
**Cache:** Supabase `article_cache` table (7-day refresh)  
**Display:** Home screen health tips carousel → tapping opens `article/[id].tsx` modal

**Condition → Wikipedia slug mapping:**

| Condition | Slugs |
|---|---|
| Diabetes | `Diabetic_diet`, `Glycemic_index`, `Blood_sugar`, `Low-carbohydrate_diet` |
| Hypertension | `Hypertension`, `DASH_diet`, `Sodium_in_diet` |
| Kidney Disease | `Renal_diet`, `Potassium`, `Phosphorus_in_biology` |
| Heart Disease | `Saturated_fat`, `Mediterranean_diet`, `Omega-3_fatty_acid` |
| Liver Disease | `Hepatic_diet`, `Cirrhosis`, `Fatty_liver_disease` |
| General | `Nutrition_facts_label`, `Ultra-processed_food`, `Food_safety` |

---

## 19. Data Flows

### Authentication
1. `login.tsx` / `register.tsx` → `authService` → Supabase Auth
2. `AuthContext` → `onAuthStateChange()` listener
3. `RootLayoutNav` → route guard (see §6)

### Profile Hydration
1. `ProfileContext` mounts → fetch from Supabase → map via `mapSupabaseProfile()`
2. Fallback: AsyncStorage → then `DEFAULT_PROFILE`
3. Every change → AsyncStorage persist + fire-and-forget Supabase sync

### Scan
1. Photo / Barcode / Text input
2. `scan-preview.tsx` → `scanService` → `scan-ai` Edge Function
3. AI returns `{ confidence, verdict, nutrients, portionGuidance, alternatives, ... }`
4. Confidence badge + portion guidance render inline
5. User logs → `insertScanLog()` + `uploadScanImage()` to Supabase Storage

---

## 20. Condition → Nutrient Target Map

| Condition | Monitored Nutrients (examples) |
|---|---|
| Diabetes | Sugar ≤25g, Carbohydrates ≤130g, Calories ≤2000kcal |
| Hypertension | Sodium ≤1500mg, Saturated Fat ≤15g |
| Kidney Disease | Sodium ≤1500mg, Potassium ≤2000mg, Phosphorus ≤800mg, Protein ≤50g |
| Heart Disease | Cholesterol ≤200mg, Saturated Fat ≤13g, Sodium ≤1500mg |
| Liver Disease | Sodium ≤1500mg, Protein ≤60g |
| Cancer | Calories ≤2200kcal, Sugar ≤30g |

De-duplication: if two conditions both monitor sodium, the lower limit wins.

---

## 21. Image Optimization (`utils/optimizeImage.ts`)

| Function | Output |
|---|---|
| `optimizeImage(uri)` | Resize to 1200px max, compress 0.6, → base64 string |
| `optimizeImageForUpload(uri)` | Same + returns optimized file URI for Supabase Storage upload |

---

## 22. Feature Status

| Feature | Status |
|---|---|
| Photo food scan + AI verdict | ✅ Live |
| Barcode scan (Open Food Facts) | ✅ Live |
| Manual food search | ✅ Live |
| AI confidence score + badge | ✅ Live |
| Portion guidance from AI | ✅ Live |
| 3-tier onboarding (conditions → goals → confirm) | ✅ Live |
| NutriBot AI assist onboarding | ✅ Live |
| NutriBot chat (full screen modal) | ✅ Live |
| Chat history screen | ✅ Live |
| Home dashboard (calorie ring + macros) | ✅ Live |
| History tab (scan log + weekly chart) | ✅ Live |
| Health summary report | ✅ Live |
| Wikipedia health tips carousel | ✅ Live |
| Article detail screen | ✅ Live |
| Profile tab (conditions, goals, personal info) | ✅ Live |
| Edit Profile (name, age, height, weight, blood type) | ✅ Live |
| FloatingNutriBotButton (global FAB) | ✅ Live |
| Scan log persistence to Supabase | ✅ Live |
| Image upload to Supabase Storage | ✅ Live |
| `portion_guidance` column in `scan_logs` | ✅ Added May 2026 |
| Dark mode | ❌ Not implemented (light-only) |
| Push notifications | 🔜 v1.1 |
| Voice input for NutriBot | 🔜 v1.1 |
| Export logs as CSV/PDF | 🔜 v1.1 |
| Doctor report sharing | 🔜 v2.0 |
| Meal planning | 🔜 v2.0 |

---

## 23. Medical Disclaimer

> *NutriScan provides nutritional guidance based on publicly available dietary standards and is intended for general educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or a registered dietitian before making significant changes to your diet, especially if you have a medical condition. Nutrient thresholds used in this app are based on guidelines from the World Health Organization (WHO) and the Philippine Department of Health (DOH).*

---

*NutriScan — Live Build Reference · May 2026*
