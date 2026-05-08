# NutriScan — Full Codebase Overview

## Architecture

- **Framework**: React Native + Expo (file-based routing via `expo-router`)
- **Backend**: Supabase (Auth, Database, Edge Functions, Storage)
- **AI Models**: Google Gemini
  - `gemma-4-31b-it` — food scan analysis (precise JSON output, temp 0.2)
  - `gemini-2.5-flash` — NutriBot chat assistant (conversational, temp 0.7)
- **External API**: Open Food Facts — barcode lookups and manual food searches
- **State Management**: React Context (`AuthContext` + `ProfileContext` with `useReducer`) + AsyncStorage for offline persistence
- **Image Handling**: `expo-image-manipulator` + `expo-file-system/legacy` for resize/compress/base64 conversion
- **Routing**: Expo Router with Stack + Tabs layout, route guards for auth and onboarding

---

## Key Screens

| Screen | Path | Purpose |
|---|---|---|
| Splash | `app/index.tsx` | Entry point / loading screen |
| Login | `app/(auth)/login.tsx` | Email/password authentication + social login placeholders |
| Register | `app/(auth)/register.tsx` | Account creation with validation + email verification |
| Auth Callback | `app/auth/callback.tsx` | OAuth deep-link handler |
| Welcome | `app/(onboarding)/welcome.tsx` | Onboarding intro — explains personalization, skip option |
| Conditions | `app/(onboarding)/conditions.tsx` | Select primary health condition (listed / custom / AI-assisted) |
| NutriBot Assist | `app/(onboarding)/nutribot-assist.tsx` | AI-guided condition classification for unsure users |
| Goals | `app/(onboarding)/goals.tsx` | Select dietary goals with emoji chips |
| Confirmation | `app/(onboarding)/confirmation.tsx` | Review and confirm onboarding selections |
| Home | `app/(tabs)/index.tsx` | Daily health summary, today's log, personalized tips |
| Scan | `app/(tabs)/scan.tsx` | Camera interface for barcode/photo scanning |
| History | `app/(tabs)/history.tsx` | Past scan logs, weekly trends, health summary |
| Profile | `app/(tabs)/profile.tsx` | Health conditions, goals, account settings |
| Scan Preview | `app/scan-preview.tsx` | Preview scanned item, select meal type, edit food name, trigger AI analysis |
| Scan Result | `app/scan-result.tsx` | Verdict display (safe/caution/avoid), nutrient breakdown, alternatives, log to history |
| NutriBot | `app/nutribot.tsx` | AI chat assistant with health profile context |
| Manual Search | `app/manual-search.tsx` | Search food products via Open Food Facts API |
| Health Report | `app/health-report.tsx` | Weekly compliance summary, risky foods, nutrient monitoring |
| Chat History | `app/chat-history.tsx` | Date-grouped conversation list, new chat button |
| Edit Profile | `app/edit-profile.tsx` | Update name, age, height, weight, blood type |
| Article Detail | `app/article/[id].tsx` | Wikipedia-sourced health article viewer |

---

## Edge Functions

### scan-ai (`supabase/functions/scan-ai/index.ts`)

- **Model**: `gemma-4-31b-it` (temperature 0.2 for precise JSON)
- **Input**: `{ image?, barcodeData?, text?, userProfile }`
- **Process**: Verifies auth token → builds system prompt with user's conditions/goals/nutrient targets → sends image + text to Gemini → parses JSON response
- **Output**: `{ foodName, verdict, explanation, safeMessage?, reasoningSummary[], alternatives[], nutrients[] }`
- **Key detail**: Strips markdown code fences from Gemini output before JSON.parse

### nutribot (`supabase/functions/nutribot/index.ts`)

- **Model**: `gemini-2.5-flash` (temperature 0.7 for conversational tone)
- **Input**: `{ messages[], profile }`
- **Process**: Verifies auth → builds NutriBot system prompt with health profile + app navigation guide → formats chat history → sends to Gemini
- **Output**: `{ reply: string }` (markdown-formatted response)
- **System prompt rules**: Personalized advice, no medical diagnoses, empathetic tone, app navigation help

### articles-fetch (`supabase/functions/articles-fetch/index.ts`)

- **Input**: `{ slugs: string[] }` (Wikipedia article slugs)
- **Process**: Verifies auth → fetches each slug from Wikipedia REST API `/page/summary/{slug}` → infers category, extracts takeaways, resolves related slugs
- **Output**: `{ articles: Article[] }` with slug, title, category, summary, content, imageUrl, sourceUrl, keyTakeaways, relatedSlugs
- **Category inference**: Keyword-based mapping (diabetes, hypertension, kidney_disease, heart_disease, liver_disease, cancer, other)

---

## Data Flow

### Authentication Flow
1. User signs in via `login.tsx` or `register.tsx` using `authService` (Supabase Auth)
2. `AuthContext` listens for auth state changes via `supabase.auth.onAuthStateChange()`
3. Session persisted automatically by Supabase JS client
4. `RootLayoutNav` enforces route guards:
   - No session → redirect to `/(auth)/login`
   - Session + no onboarding → redirect to `/(onboarding)/welcome`
   - Session + onboarding done + on auth screen → redirect to `/(tabs)`

### Profile Hydration Flow
1. `ProfileContext` hydrates on mount
2. If user exists → fetch from Supabase (`getUserProfile`) → map via `mapSupabaseProfile()`
3. If Supabase fails → fall back to AsyncStorage (`@nutriscan/profile`)
4. Every profile change after hydration → persisted to AsyncStorage + synced to Supabase (fire-and-forget)

### Scan Flow
1. Camera captures photo OR barcode scanner reads barcode OR user enters text
2. `scan-preview.tsx`:
   - Photo: optimize image via `optimizeImageForUpload()` → send base64 to `scan-ai` Edge Function
   - Barcode: look up Open Food Facts API → send product data to `scan-ai` Edge Function
   - Manual: send text to `scan-ai` Edge Function
3. Edge Function returns verdict + nutrients + alternatives
4. Navigate to `scan-result.tsx` with result data
5. User logs scan → `insertScanLog()` to Supabase + `uploadScanImage()` to Supabase Storage

### Chat Flow
1. User opens NutriBot → `nutribot.tsx`
2. New conversation: `createConversation()` in Supabase
3. Existing conversation: `getMessages()` loads history
4. User sends message → `insertMessage()` to Supabase → call `nutribot` Edge Function → insert bot reply
5. Chat history viewable in `chat-history.tsx` via `getConversations()`

### Health Condition → Nutrient Targets
1. User selects conditions during onboarding
2. `buildNutrientTargets(conditions)` maps each condition to monitored nutrients
3. Duplicate nutrients across conditions → most restrictive (lowest) daily limit wins
4. Targets stored in `user_nutrient_targets` table and used in scan-ai prompts

---

## Type System (`types/health.ts`)

### HealthCondition
```
'diabetes' | 'hypertension' | 'heart_disease' | 'kidney_disease' | 'liver_disease' | 'cancer' | 'other' | 'unsure'
```
- Each condition maps to specific nutrient targets via `conditionNutrientMap`
- Display labels via `conditionLabels`, descriptions via `conditionDescriptions`

### Verdict
```
'safe' | 'caution' | 'avoid'
```
- Three-tier food safety rating system
- Display labels via `verdictLabels`

### HealthGoal
```
'lower_sugar' | 'reduce_sodium' | 'manage_weight' | 'cut_fat' | 'protect_kidneys' | 'avoid_processed' | 'protect_heart' | 'doctor_other'
```
- Multi-select during onboarding
- Display labels via `goalLabels`, emoji icons via `goalIcons`

### MonitoredNutrient
```
'sugar' | 'sodium' | 'calories' | 'saturated_fat' | 'cholesterol' | 'potassium' | 'phosphorus' | 'protein' | 'carbohydrates' | 'fiber'
```

### NutrientTarget
```typescript
{ nutrient: MonitoredNutrient; label: string; dailyLimit: number; unit: string }
```
- Auto-generated from conditions via `buildNutrientTargets()`
- De-duplicated with most restrictive limit

### UserHealthProfile
```typescript
{
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

### FoodItem
```typescript
{
  id: string;
  user_id?: string;
  name: string;
  verdict: Verdict;
  imageUri?: string;
  image_url?: string;
  scannedAt: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
```

---

## Context Providers

### AuthContext (`context/AuthContext.tsx`)
- **State**: `session`, `user`, `isLoading`
- **Actions**: `signOut()`
- **Init**: Loads persisted session via `supabase.auth.getSession()`, then listens for changes via `onAuthStateChange()`
- **Mount safety**: Uses `mountedRef` to prevent state updates after unmount

### ProfileContext (`context/ProfileContext.tsx`)
- **State**: `profile` (UserHealthProfile), `isLoading`, `isHydrated`, `hydrationError`
- **Architecture**: `useReducer` with typed actions (HYDRATE, SET_CONDITIONS, SET_GOALS, COMPLETE_ONBOARDING, etc.)
- **Persistence**: AsyncStorage (`@nutriscan/profile`) on every change after hydration
- **Supabase sync**: Fire-and-forget writes on every state change (conditions, goals, profile fields, onboarding completion)
- **Hydration priority**: Supabase first → AsyncStorage fallback → DEFAULT_PROFILE
- **Actions**:
  - `setPrimaryCondition()` — sets condition + auto-builds nutrient targets + syncs to Supabase
  - `setConditions()` — replaces all conditions + rebuilds targets
  - `setGoals()` — updates dietary goals
  - `setNutriBotNote()` — saves AI chat note
  - `completeOnboarding()` — marks onboarding done + bulk syncs all profile data
  - `updateProfile()` — partial update with field mapping (camelCase → snake_case for Supabase)
  - `resetProfile()` — clears local state + AsyncStorage (preserves remote data)

---

## Theming

### Color System (`constants/theme/colors.ts`)
- **Primary**: Teal shades (50–900) for brand identity
- **Verdict colors**: `safe` (green), `caution` (amber), `avoid` (red)
- **Neutral**: Gray scale (50–950) for text, surfaces, borders
- **Light + Dark themes**: Full token sets for both modes

### Theme Hook (`hooks/useTheme.ts`)
- Resolves `useColorScheme()` → returns `lightTheme` or `darkTheme`
- Theme object includes: `colors`, `fontSizes`, `fontWeights`, `lineHeights`, `radius`, `shadows`

### Tab Layout (`app/(tabs)/_layout.tsx`)
- 4 tabs: Home, Scan, History, Profile
- Ionicons with focused/unfocused variants
- `FloatingNutriBotButton` overlay on all tabs

---

## Utilities

### Image Optimization (`utils/optimizeImage.ts`)
- `optimizeImage(uri)`: Resize to 1024px max dimension, compress to 0.7 quality, convert to base64
- `optimizeImageForUpload(uri)`: Same as above but returns both base64 and optimized file URI for upload
- Logs size comparison (original vs optimized) for debugging

---

## Services

### Supabase Service (`services/supabaseService.ts`)
- **Profile**: `getUserProfile()`, `updateUserProfile()`
- **Conditions**: `upsertUserConditions()` — delete-then-insert pattern
- **Nutrient Targets**: `upsertNutrientTargets()` — delete-then-insert pattern
- **Scan Logs**: `insertScanLog()`, `getTodaysScanLogs()`, `getWeeklyScanLogs()`, `getAllUserScans()`
- **Chat**: `getConversations()`, `getMessages()`, `createConversation()`, `insertMessage()`
- **Article Cache**: `getCachedArticles()`, `getArticleBySlug()`, `upsertArticleCache()`

### Storage Service (`services/storageService.ts`)
- `uploadScanImage()` — uploads image to Supabase Storage bucket

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `user_profiles` | User profile data (name, age, goals, onboarding status, etc.) |
| `user_conditions` | Health conditions per user (one row per condition) |
| `user_nutrient_targets` | Monitored nutrients with daily limits per user |
| `scan_logs` | Food scan history with verdict, nutrients, meal type |
| `chat_conversations` | NutriBot conversation metadata |
| `chat_messages` | Individual chat messages (user/assistant) |
| `article_cache` | Cached Wikipedia articles with category, takeaways, related slugs |

---

## Route Guards (`app/_layout.tsx`)

The `RootLayoutNav` component enforces navigation rules:
- **Unauthenticated** → redirect to `/(auth)/login`
- **Authenticated + onboarding incomplete** → redirect to `/(onboarding)/welcome`
- **Authenticated + onboarding complete + on auth screen** → redirect to `/(tabs)`
- **Authenticated + onboarding incomplete + on auth screen** → redirect to `/(onboarding)/welcome`

Screen animations:
- `scan-preview`, `scan-result`, `chat-history`, `health-report` → slide from right
- `manual-search`, `nutribot`, `article/[id]` → modal (slide from bottom)
- `auth/callback` → fade
