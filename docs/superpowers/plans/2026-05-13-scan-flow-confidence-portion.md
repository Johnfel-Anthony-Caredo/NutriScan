# AI Confidence & Portion Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI confidence indicator and passive portion guidance to the scan result display in scan-preview.tsx

**Architecture:** Extend the existing ScanAiResponse and ScanResultData types with two optional fields (`confidence`, `portionGuidance`), update the Edge Function prompt to request them, and display them as lightweight visual elements in the existing result UI. No new state machine, no interactive steps.

**Tech Stack:** React Native (Expo), TypeScript, Supabase Edge Function (Gemini AI), scan-preview.tsx

---

### Task 1: Update ScanResultData type in mockData.ts

**Files:**
- Modify: `data/mockData.ts:24-37`

- [ ] **Step 1: Add confidence and portionGuidance fields to ScanResultData**

Edit the `ScanResultData` interface to add two new optional fields:

```typescript
export interface ScanResultData {
  id: string;
  foodName: string;
  verdict: Verdict;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  scannedAt: string;
  explanation: string;
  safeMessage?: string;
  nutrients: NutrientInfo[];
  alternatives?: { name: string; verdict: Verdict }[];
  confidence?: number;           // 0-1, AI confidence in food identification
  portionGuidance?: string;      // portion recommendation hint
}
```

- [ ] **Step 2: Verify the file still parses correctly**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30` from project root
Expected: No type errors related to ScanResultData

- [ ] **Step 3: Commit**

```bash
git add data/mockData.ts
git commit -m "feat(types): add confidence and portionGuidance to ScanResultData"
```

---

### Task 2: Update ScanAiResponse type in scanService.ts

**Files:**
- Modify: `services/scanService.ts:24-32`

- [ ] **Step 1: Add confidence and portionGuidance to ScanAiResponse**

```typescript
export interface ScanAiResponse {
  foodName: string;
  verdict: Verdict;
  explanation: string;
  safeMessage?: string;
  reasoningSummary: string[];
  alternatives: { name: string; verdict: Verdict }[];
  nutrients: NutrientInfo[];
  confidence?: number;           // 0-1 from AI
  portionGuidance?: string;      // e.g. "Best eaten in small portions"
}
```

- [ ] **Step 2: Update buildScanResultFromAiResponse to pass through the new fields**

Find the `buildScanResultFromAiResponse` function (line ~330) and add the two new fields:

```typescript
export function buildScanResultFromAiResponse(
  aiResponse: ScanAiResponse,
  mealType: string,
  source: 'photo' | 'barcode' | 'manual',
): ScanResultData {
  return {
    id: `scan-${Date.now()}`,
    foodName: aiResponse.foodName,
    verdict: aiResponse.verdict,
    mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    scannedAt: new Date().toISOString(),
    explanation: aiResponse.explanation,
    safeMessage: aiResponse.safeMessage,
    nutrients: aiResponse.nutrients,
    alternatives: aiResponse.alternatives,
    confidence: aiResponse.confidence,
    portionGuidance: aiResponse.portionGuidance,
  };
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add services/scanService.ts
git commit -m "feat(scan): add confidence and portionGuidance to scan AI types"
```

---

### Task 3: Update Supabase scan_logs service

**Files:**
- Modify: `services/supabaseService.ts:5-15, 77-102`

- [ ] **Step 1: Add portion_guidance to ScanLogRow**

```typescript
export interface ScanLogRow {
  id: string;
  user_id: string;
  food_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
  verdict: Verdict;
  reason?: string | null;
  image_url?: string | null;
  scanned_at: string;
  source: 'photo' | 'barcode' | 'manual';
  portion_guidance?: string | null;
}
```

- [ ] **Step 2: Add portion_guidance to insertScanLog**

In the `insertScanLog` function, add the field to the insert payload:

```typescript
export async function insertScanLog(
  userId: string,
  result: ScanResultData,
  source: 'photo' | 'barcode' | 'manual',
  imageUrl?: string
) {
  const { data, error } = await supabase
    .from('scan_logs')
    .insert({
      user_id: userId,
      food_name: result.foodName,
      meal_type: result.mealType,
      verdict: result.verdict,
      reason: result.explanation,
      image_url: imageUrl,
      source,
      nutrients: result.nutrients,
      alternatives: result.alternatives ?? [],
      portion_guidance: result.portionGuidance ?? null,
      scanned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScanLogRow;
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add services/supabaseService.ts
git commit -m "feat(supabase): add portion_guidance to scan log types"
```

---

### Task 4: Update Edge Function prompt

**Files:**
- Modify: `supabase/functions/scan-ai/index.ts`

- [ ] **Step 1: Add confidence and portionGuidance to the system instruction JSON schema**

Find the `systemInstruction` string (around line 53) and update the JSON schema within it:

```typescript
const systemInstruction = `You are a nutrition analyst. Analyze the provided food data (image, barcode data, or text) against the user's specific health profile:
- Health Conditions: ${conditions}
- Health Goals: ${goals}
- Monitored Nutrients: ${nutrientTargets}

Your response MUST be ONLY valid JSON matching this structure exactly (no markdown formatting, no \`\`\`json wrappers):
{
  "confidence": 0.95,
  "foodName": "Name of the identified food",
  "verdict": "safe" | "caution" | "avoid",
  "explanation": "Detailed, specific explanation of why this food is safe/caution/avoid based on their profile.",
  "safeMessage": "Optional brief encouraging message if safe",
  "reasoningSummary": ["Bullet point 1", "Bullet point 2"],
  "alternatives": [
    { "name": "Alternative 1", "verdict": "safe" }
  ],
  "nutrients": [
    {
      "nutrient": "calories" | "sugar" | "sodium" | "carbs" | "fat" | "protein",
      "label": "Display label",
      "value": 100,
      "unit": "g" | "mg" | "kcal",
      "dailyLimit": 2000,
      "overLimit": false,
      "warning": "Optional warning string if over limit"
    }
  ],
  "portionGuidance": "Optional short phrase about portion considerations based on the verdict (e.g. 'Best eaten in small portions', 'Fine in moderation', 'Avoid large servings')"
}

Rules:
1. Provide a precise JSON output. DO NOT wrap the output in markdown code blocks.
2. Set confidence based on how certain you are about the food identification (1.0 = absolutely certain, 0.0 = completely unsure). Factor in image quality, clarity, and whether the food is clearly identifiable.
3. Consider the user's specific conditions carefully. If the food is dangerous for their conditions, set verdict to "avoid" or "caution".
4. Extract nutrients as accurately as possible from the image or barcode data.
5. portionGuidance should reflect the verdict and conditions — "Best in small portions" for avoid/caution, "Fine in moderation" for safe items.
`
```

Key additions:
- `"confidence": 0.95` in the JSON schema
- `"portionGuidance": "..."` in the JSON schema
- Rule #2 explaining how confidence should be set
- Rule #5 explaining portionGuidance

- [ ] **Step 2: Verify the function deploys correctly**

Run: `cd supabase && npx supabase functions serve scan-ai --no-verify-jwt &`
Wait 5 seconds, then kill the process.
Expected: No syntax errors in the Edge Function output

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/scan-ai/index.ts
git commit -m "feat(edge): add confidence and portionGuidance to scan-ai prompt"
```

---

### Task 5: Add confidence indicator and portion guidance to scan-preview.tsx

**Files:**
- Modify: `app/scan-preview.tsx`

- [ ] **Step 1: Add a confidence badge helper function**

Add this before the component or as a local function inside ScanPreviewScreen:

```typescript
/** Renders a small confidence indicator next to the food name */
function ConfidenceBadge({ confidence, theme }: { confidence?: number; theme: any }) {
  if (confidence === undefined) return null;

  const isHigh = confidence >= 0.8;
  const isMedium = confidence >= 0.5 && confidence < 0.8;
  const isLow = confidence < 0.5;

  const bgColor = isHigh ? '#E8F5E9' : isMedium ? '#FFF8E1' : '#FFEBEE';
  const textColor = isHigh ? '#2E7D32' : isMedium ? '#F57F17' : '#C62828';
  const icon = isHigh ? 'checkmark-circle' : isMedium ? 'help-circle' : 'alert-circle';

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: bgColor,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginTop: 4,
      alignSelf: 'flex-start',
    }}>
      <Ionicons name={icon} size={14} color={textColor} />
      <Text style={{
        color: textColor,
        fontSize: 11,
        fontWeight: '600',
        fontFamily: theme.fontFamilies?.body,
        marginLeft: 4,
      }}>
        {isHigh ? 'Identified' : `${Math.round(confidence * 100)}% confident`}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Add portion guidance render helper**

```typescript
/** Renders portion guidance as a small inline note in the explanation card */
function PortionGuidanceNote({ text, theme }: { text?: string; theme: any }) {
  if (!text) return null;
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.08)',
    }}>
      <Ionicons name="restaurant-outline" size={16} color={theme.colors?.textTertiary || '#999'} />
      <Text style={{
        color: theme.colors?.textTertiary || '#999',
        fontSize: theme.fontSizes?.xs || 12,
        fontFamily: theme.fontFamilies?.body,
        marginLeft: 6,
        flex: 1,
        fontStyle: 'italic',
      }}>
        {text}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Insert the confidence badge in the verdict header area**

In the `result ?` content section of ScanPreviewScreen (around line 293), add the confidence badge below the food name:

Current:
```tsx
<Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>
  {result.foodName}
</Text>
<Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>
  {result.mealType.charAt(0).toUpperCase() + result.mealType.slice(1)} · {new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
</Text>
```

Replace with:
```tsx
<Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>
  {result.foodName}
</Text>
<ConfidenceBadge confidence={result.confidence} theme={theme} />
<Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>
  {result.mealType.charAt(0).toUpperCase() + result.mealType.slice(1)} · {new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
</Text>
```

- [ ] **Step 4: Insert portion guidance inside the explanation card**

Inside the explanation card (around line 318), after the explanation text and before the closing of `explainBody`, add the portion guidance:

After:
```tsx
<Text style={{ color: textColor, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, lineHeight: theme.lineHeights.body }}>
  {result.explanation}
</Text>
```

Add:
```tsx
<PortionGuidanceNote text={result.portionGuidance} theme={theme} />
```

The full block should look like:
```tsx
<View style={[styles.explainCard, { backgroundColor: cardBg, borderColor: theme.colors.border }]}>
  <View style={styles.explainBody}>
    <View style={[styles.explainHeader, { borderBottomColor: accentColor }]}>
      <Ionicons name={isAvoid ? 'warning' : isCaution ? 'alert-circle' : 'checkmark-circle'} size={18} color={accentColor} />
      <Text style={{ color: textColor, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.heading, marginLeft: 8, letterSpacing: 0.5 }}>
        {isAvoid ? 'NOT RECOMMENDED' : isCaution ? 'USE WITH CAUTION' : 'GOOD CHOICE'}
      </Text>
    </View>
    <Text style={{ color: textColor, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, lineHeight: theme.lineHeights.body }}>
      {result.explanation}
    </Text>
    <PortionGuidanceNote text={result.portionGuidance} theme={theme} />
    {result.verdict === 'safe' && result.safeMessage && (
      <View style={[styles.safeRow, { borderTopColor: accentColor }]}>
        <Ionicons name="checkmark-circle" size={16} color={accentColor} />
        <Text style={{ color: textColor, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginLeft: 6, flex: 1 }}>
          {result.safeMessage}
        </Text>
      </View>
    )}
  </View>
</View>
```

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add app/scan-preview.tsx
git commit -m "feat(ui): add confidence badge and portion guidance to scan result"
```

---

### Task 6: Update scan-result.tsx with the same elements

**Files:**
- Modify: `app/scan-result.tsx`

- [ ] **Step 1: Add the same confidence badge and portion guidance to the legacy result screen**

In the verdict header section of scan-result.tsx (around line 125), add ConfidenceBadge after the food name. In the alert/safe card section, add portion guidance note.

Since scan-result.tsx uses inline styles similar to scan-preview, add the sub-components inline or as simple JSX blocks.

After the food name text (around line 127):
```tsx
<Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 16 }}>
  {result.foodName}
</Text>
{/* Insert confidence badge here */}
{result.confidence !== undefined && (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: result.confidence >= 0.8 ? '#E8F5E9' : result.confidence >= 0.5 ? '#FFF8E1' : '#FFEBEE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  }}>
    <Ionicons
      name={result.confidence >= 0.8 ? 'checkmark-circle' : result.confidence >= 0.5 ? 'help-circle' : 'alert-circle'}
      size={14}
      color={result.confidence >= 0.8 ? '#2E7D32' : result.confidence >= 0.5 ? '#F57F17' : '#C62828'}
    />
    <Text style={{
      color: result.confidence >= 0.8 ? '#2E7D32' : result.confidence >= 0.5 ? '#F57F17' : '#C62828',
      fontSize: 11,
      fontWeight: '600',
      fontFamily: theme.fontFamilies.body,
      marginLeft: 4,
    }}>
      {result.confidence >= 0.8 ? 'Identified' : `${Math.round(result.confidence * 100)}% confident`}
    </Text>
  </View>
)}
```

Inside the alert card (for caution/avoid) or safe card, add portion guidance after the explanation:
```tsx
{result.portionGuidance && (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' }}>
    <Ionicons name="restaurant-outline" size={16} color={theme.colors.textTertiary} />
    <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginLeft: 6, flex: 1, fontStyle: 'italic' }}>
      {result.portionGuidance}
    </Text>
  </View>
)}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add app/scan-result.tsx
git commit -m "feat(ui): add confidence badge and portion guidance to scan-result"
```
