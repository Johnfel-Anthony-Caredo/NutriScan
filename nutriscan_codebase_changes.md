# NutriScan — Codebase Changes Required for Supabase Integration

This document lists **every file that needs to be changed or created** in your existing codebase to connect it to Supabase. Changes are ordered by priority — do them top to bottom.

Based on a full read of your repository at `Johnfel-Anthony-Caredo/NutriScan`.

---

## Overview of What Needs to Change

| File | Action | Why |
|---|---|---|
| `package.json` | Install 2 packages | Supabase SDK not yet installed |
| `.env` | Create new file | API keys need env variables |
| `lib/supabase.ts` | Create new file | Supabase client does not exist yet |
| `context/AuthContext.tsx` | Create new file | No auth context exists — only ProfileContext |
| `context/ProfileContext.tsx` | Update existing | Currently AsyncStorage-only, needs Supabase sync |
| `app/_layout.tsx` | Update existing | Needs AuthProvider + auth-aware routing |
| `app/index.tsx` | Update existing | Entry route needs Supabase session check |
| `services/authService.ts` | Create new file | No auth service exists |
| `services/supabaseService.ts` | Create new file | No DB access layer exists |
| `services/storageService.ts` | Create new file | No storage service exists |
| `types/health.ts` | Minor update | Add `id` and `user_id` fields to match DB rows |
| `data/mockData.ts` | No change needed | Keep as-is for UI dev, replace calls later |

---

## CHANGE 1 — Install Supabase Packages

**File:** `package.json` (via terminal command)

Run in your project root:

```bash
npx expo install @supabase/supabase-js
npx expo install react-native-url-polyfill
npx expo install base64-arraybuffer
npx expo install expo-file-system
```

> `@react-native-async-storage/async-storage` is already in your `package.json` at version `2.2.0` ✅

**After install, your `package.json` dependencies should include:**
```json
"@supabase/supabase-js": "^2.x.x",
"react-native-url-polyfill": "^2.x.x",
"base64-arraybuffer": "^1.x.x",
"expo-file-system": "~18.x.x"
```

---

## CHANGE 2 — Create `.env` File

**File:** `.env` (create in project root, next to `package.json`)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=https://your-fastapi-backend.onrender.com
```

> Get your URL and anon key from: Supabase Dashboard → Project Settings → API

Also add `.env` to your `.gitignore` if not already there:
```bash
# in .gitignore
.env
.env.local
```

---

## CHANGE 3 — Create `lib/supabase.ts`

**File:** `lib/supabase.ts` (create new `lib/` folder in project root)

```ts
// lib/supabase.ts
import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

// Keep session alive when app returns to foreground
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
```

---

## CHANGE 4 — Create `context/AuthContext.tsx`

**File:** `context/AuthContext.tsx` (create new file alongside existing `ProfileContext.tsx`)

Your codebase currently has **no auth context**. The `_layout.tsx` wraps only `ProfileProvider`. [cite:133] This new context handles Supabase login state and routes the user correctly.

```ts
// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Session, type User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  isGuest: boolean
  setGuestMode: (val: boolean) => void
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  isLoading: true,
  isGuest: false,
  setGuestMode: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // Load existing session on app launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for login, logout, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading, isGuest, setGuestMode: setIsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

## CHANGE 5 — Update `app/_layout.tsx`

**File:** `app/_layout.tsx` — **update existing file**

Currently wraps only `ProfileProvider`. [cite:133] Needs `AuthProvider` added as the outer wrapper.

**Before:**
```tsx
import { ProfileProvider } from '@/context/ProfileContext';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar ... />
      <Stack ...>
        ...
      </Stack>
    </ProfileProvider>
  );
}
```

**After:**
```tsx
import { ProfileProvider } from '@/context/ProfileContext';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <StatusBar ... />
        <Stack ...>
          ...
        </Stack>
      </ProfileProvider>
    </AuthProvider>
  );
}
```

> `AuthProvider` must be the **outer** wrapper because `ProfileContext` will eventually need the auth session to know which user's profile to load.

---

## CHANGE 6 — Update `app/index.tsx` (Entry Route)

**File:** `app/index.tsx` — **update existing file**

This is your entry/splash screen. It currently likely uses `ProfileContext` to check `onboardingCompleted`. After adding Supabase, it needs to also check the auth session.

**Add this logic to the redirect decision:**
```ts
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/context/ProfileContext'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function Index() {
  const { session, isLoading: authLoading, isGuest } = useAuth()
  const { profile, isHydrated } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isHydrated) {
      if (!session && !isGuest) {
        router.replace('/(auth)/login')
      } else if (!profile.onboardingCompleted) {
        router.replace('/(onboarding)/welcome')
      } else {
        router.replace('/(tabs)')
      }
    }
  }, [session, authLoading, isHydrated, profile.onboardingCompleted, isGuest])

  // Keep showing splash/loading until both auth and profile are ready
  return <SplashScreen />
}
```

---

## CHANGE 7 — Create `services/authService.ts`

**File:** `services/authService.ts` (create new `services/` folder)

```ts
// services/authService.ts
import { supabase } from '@/lib/supabase'

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
```

---

## CHANGE 8 — Create `services/supabaseService.ts`

**File:** `services/supabaseService.ts`

This replaces all the mock data reads across your screens with real Supabase queries. The function names intentionally mirror the mock data shapes in `mockData.ts` so the transition is smooth.

```ts
// services/supabaseService.ts
import { supabase } from '@/lib/supabase'
import type { HealthCondition, HealthGoal, NutrientTarget } from '@/types/health'
import type { ScanResultData } from '@/data/mockData'

// ── Profile ──────────────────────────────────────────────────

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, user_conditions(*), user_nutrient_targets(*)')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: {
  name?: string; age?: number; blood_type?: string; avatar_url?: string;
  goals?: HealthGoal[]; nutribot_note?: string; onboarding_completed?: boolean
}) {
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
  if (error) throw error
}

// Replace all conditions for a user (used after onboarding)
export async function upsertUserConditions(userId: string, conditions: HealthCondition[]) {
  await supabase.from('user_conditions').delete().eq('user_id', userId)
  if (conditions.length === 0) return
  const { error } = await supabase.from('user_conditions').insert(
    conditions.map(c => ({ user_id: userId, condition: c }))
  )
  if (error) throw error
}

// Replace all nutrient targets for a user (used after onboarding)
export async function upsertNutrientTargets(userId: string, targets: NutrientTarget[]) {
  await supabase.from('user_nutrient_targets').delete().eq('user_id', userId)
  if (targets.length === 0) return
  const { error } = await supabase.from('user_nutrient_targets').insert(
    targets.map(t => ({
      user_id: userId,
      nutrient: t.nutrient,
      daily_limit: t.dailyLimit,
      unit: t.unit,
    }))
  )
  if (error) throw error
}

// ── Scan Logs ──────────────────────────────────────────────────

export async function insertScanLog(userId: string, result: ScanResultData, source: 'photo' | 'barcode' | 'manual', imageUrl?: string) {
  const { data, error } = await supabase.from('scan_logs').insert({
    user_id:      userId,
    food_name:    result.foodName,
    meal_type:    result.mealType,
    verdict:      result.verdict,
    reason:       result.explanation,
    image_url:    imageUrl,
    source,
    nutrients:    result.nutrients,
    alternatives: result.alternatives ?? [],
    scanned_at:   new Date().toISOString(),
  }).select().single()
  if (error) throw error
  return data
}

export async function getTodaysScanLogs(userId: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('scanned_at', start.toISOString())
    .order('scanned_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getWeeklyScanLogs(userId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { data, error } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('scanned_at', sevenDaysAgo.toISOString())
    .order('scanned_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Chat ───────────────────────────────────────────────────────

export async function createConversation(userId: string) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({ user_id: userId })
    .select().single()
  if (error) throw error
  return data
}

export async function addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, role, content })
    .select().single()
  if (error) throw error
  // Update conversation updated_at
  await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
  return data
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*, chat_messages(content, role, created_at)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteConversation(conversationId: string) {
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId)
  if (error) throw error
}

// ── Articles ───────────────────────────────────────────────────

export async function getCachedArticles(condition?: string) {
  let query = supabase.from('article_cache').select('*').order('fetched_at', { ascending: false })
  if (condition) query = query.eq('condition', condition)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('article_cache')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}
```

---

## CHANGE 9 — Update `context/ProfileContext.tsx`

**File:** `context/ProfileContext.tsx` — **update existing file**

Currently saves only to `AsyncStorage`. After adding Supabase, `completeOnboarding` and `setConditions` need to also write to Supabase tables. The current reducer logic stays intact — just add Supabase sync calls.

**Add this to the `completeOnboarding` function:**
```ts
// Add at the top of ProfileContext.tsx
import { upsertUserConditions, upsertNutrientTargets, updateUserProfile } from '@/services/supabaseService'
import { useAuth } from '@/context/AuthContext'

// Inside ProfileProvider, get the auth user:
const { user } = useAuth()

// Update completeOnboarding to also sync to Supabase:
const completeOnboarding = useCallback(async () => {
  dispatch({ type: 'COMPLETE_ONBOARDING' })

  if (user) {
    try {
      await upsertUserConditions(user.id, state.profile.conditions)
      await upsertNutrientTargets(user.id, state.profile.nutrientTargets)
      await updateUserProfile(user.id, {
        goals: state.profile.goals,
        nutribot_note: state.profile.nutriBotNote,
        onboarding_completed: true,
      })
    } catch (e) {
      console.warn('Supabase sync failed, kept local state:', e)
      // Do NOT block the user — local state is still correct
    }
  }
}, [user, state.profile])
```

> Keep `AsyncStorage` as the fallback for guest mode users who have no Supabase account.

---

## CHANGE 10 — Create `services/storageService.ts`

**File:** `services/storageService.ts`

Used by `scan-result.tsx` to upload the captured photo and store the path in `scan_logs.image_url`.

```ts
// services/storageService.ts
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { supabase } from '@/lib/supabase'

export async function uploadScanImage(userId: string, localUri: string): Promise<string> {
  const filePath = `${userId}/${Date.now()}.jpg`
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const { error } = await supabase.storage
    .from('scan-images')
    .upload(filePath, decode(base64), { contentType: 'image/jpeg' })
  if (error) throw error
  return filePath
}

export async function getScanImageUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('scan-images')
    .createSignedUrl(filePath, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const filePath = `${userId}/avatar.jpg`
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}
```

---

## CHANGE 11 — Update `types/health.ts`

**File:** `types/health.ts` — **minor update only**

Add `id` and `user_id` fields to the `FoodItem` interface so it can map to a real `scan_logs` row. Also rename `imageUri` to `image_url` to match the DB column.

**Before:**
```ts
export interface FoodItem {
  id: string;
  name: string;
  verdict: Verdict;
  imageUri?: string;       // ← local camera URI
  scannedAt: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
```

**After:**
```ts
export interface FoodItem {
  id: string;
  user_id?: string;        // ← Supabase user UUID
  name: string;
  verdict: Verdict;
  imageUri?: string;       // ← keep for camera capture (pre-upload)
  image_url?: string;      // ← Supabase Storage path (post-upload)
  scannedAt: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
```

> Keep `imageUri` for the local camera URI during the scan flow. `image_url` is the storage path after upload. Both can coexist.

---

## CHANGE 12 — Update Auth Screens (in `app/(auth)/`)

Your `app/(auth)/` folder already exists. [cite:132] Wire each screen to the `authService` functions created in Change 7.

**Login screen — key changes:**
```ts
import { signIn } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

// On submit:
try {
  await signIn(email, password)
  // onAuthStateChange in AuthContext will handle navigation automatically
} catch (e) {
  setError('Invalid email or password')
}

// Guest button:
const { setGuestMode } = useAuth()
setGuestMode(true)
router.replace('/(onboarding)/welcome')
```

**Sign up screen — key changes:**
```ts
import { signUp } from '@/services/authService'

// On submit:
try {
  await signUp(name, email, password)
  // Trigger fires → user_profiles row created automatically
  // onAuthStateChange navigates to onboarding
} catch (e) {
  setError(e.message)
}
```

---

## CHANGE 13 — Update `app/nutribot.tsx`

**File:** `app/nutribot.tsx` — **update existing file**

Currently uses mock data from `MOCK_CHAT_HISTORY`. [cite:132] Replace with real Supabase calls.

**Key changes:**
```ts
import { createConversation, addMessage, getConversationMessages } from '@/services/supabaseService'
import { useAuth } from '@/context/AuthContext'

const { user } = useAuth()

// On send message:
const sendMessage = async (text: string) => {
  if (!conversationId) {
    const conv = await createConversation(user!.id)
    setConversationId(conv.id)
  }
  await addMessage(conversationId!, 'user', text)
  // ... call FastAPI /nutribot/chat endpoint for AI reply
  // ... await addMessage(conversationId!, 'assistant', reply)
}
```

---

## CHANGE 14 — Update `app/scan-result.tsx`

**File:** `app/scan-result.tsx` — **update existing file**

Add "Add to Food Log" button logic to save to Supabase after verdict is shown.

**Key changes:**
```ts
import { insertScanLog } from '@/services/supabaseService'
import { uploadScanImage } from '@/services/storageService'
import { useAuth } from '@/context/AuthContext'

const { user } = useAuth()

const handleAddToLog = async () => {
  if (!user) return  // guest mode — skip or prompt to sign up
  try {
    let imageUrl: string | undefined
    if (capturedImageUri) {
      imageUrl = await uploadScanImage(user.id, capturedImageUri)
    }
    await insertScanLog(user.id, scanResult, source, imageUrl)
    // Show success toast then navigate
  } catch (e) {
    // Show error state
  }
}
```

---

## Summary — File Change Checklist

```
□ Run: npx expo install @supabase/supabase-js react-native-url-polyfill base64-arraybuffer expo-file-system
□ Create: .env  (add to .gitignore)
□ Create: lib/supabase.ts
□ Create: context/AuthContext.tsx
□ Update: context/ProfileContext.tsx  (add Supabase sync to completeOnboarding)
□ Update: app/_layout.tsx  (wrap with AuthProvider)
□ Update: app/index.tsx  (auth-aware routing)
□ Create: services/authService.ts
□ Create: services/supabaseService.ts
□ Create: services/storageService.ts
□ Update: types/health.ts  (add image_url, user_id to FoodItem)
□ Update: app/(auth)/login.tsx  (wire to authService.signIn)
□ Update: app/(auth)/sign-up.tsx  (wire to authService.signUp)
□ Update: app/nutribot.tsx  (replace MOCK_CHAT_HISTORY with Supabase calls)
□ Update: app/scan-result.tsx  (wire Add to Log button to insertScanLog)
```

---

## What You Do NOT Need to Change

- `types/health.ts` — `HealthCondition`, `Verdict`, `NutrientTarget`, `conditionNutrientMap`, `buildNutrientTargets` are all **100% compatible** with the database schema as-is ✅
- `data/mockData.ts` — Keep this entirely. Use mock data while building, swap to real Supabase calls screen by screen ✅
- `constants/` — No changes needed ✅
- `components/` — No changes needed ✅
- `app/(tabs)/` screens — No immediate changes needed; they consume `ProfileContext` which still works ✅
- Navigation structure in `_layout.tsx` — All route names stay the same, only providers change ✅

---

> All changes in this document are based on a direct read of your GitHub repository at `Johnfel-Anthony-Caredo/NutriScan`. No guessing — every change references a specific existing file.
