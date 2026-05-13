# AI Confidence & Portion Guidance

**Date:** 2026-05-13
**Status:** Approved Design

## Summary

Add two lightweight informational features to the scan result in `scan-preview.tsx`:
1. **AI Confidence Indicator** — Show the AI's confidence score visually next to the detected food name
2. **Portion Guidance** — Show a passive warning/indicator about portion considerations based on the verdict

No extra steps, no interactive UI for either feature — just smart information displayed in the existing result screen. The flow stays the same: **Analyze → loading → Show verdict**.

## Architecture

- Edge Function returns `confidence` (0-1) and optional `portionGuidance` string
- `scan-preview.tsx` displays both as lightweight visual elements within the existing result content
- No new state machine steps, no confirmation screens, no portion selector

## Data Types

### ScanResultData (data/mockData.ts) — new fields
```typescript
interface ScanResultData {
  // ... existing fields ...
  confidence?: number;           // 0-1 from AI
  portionGuidance?: string;      // e.g. "Best eaten in small portions"
}
```

### ScanAiResponse (services/scanService.ts) — new field
```typescript
interface ScanAiResponse {
  // ... existing fields ...
  confidence?: number;
  portionGuidance?: string;
}
```

### ScanLogRow (services/supabaseService.ts) — new field
```typescript
interface ScanLogRow {
  // ... existing fields ...
  portion_guidance?: string | null;
}
```

## Edge Function Changes

Add `confidence` and `portionGuidance` to the JSON schema in the system instruction:

```json
{
  "confidence": 0.95,
  "foodName": "...",
  "portionGuidance": "Fine in moderation — watch sodium per serving.",
  ...
}
```

Instruct the AI to:
- Return `confidence` (0-1) reflecting certainty about food identification
- Return `portionGuidance` — a short hint about portion considerations based on the verdict (e.g., "Best in small portions" for avoid/caution foods, "Fine in moderation" for safe foods)

## UI Changes

### Confidence Indicator
In the verdict header row (next to or below the food name), show a small confidence indicator:
- Confidence ≥ 80%: subtle checkmark or green badge, no text needed
- Confidence 50-79%: small amber tag showing "XX% confident"
- Confidence < 50%: small red tag showing "XX% confident — verify if unsure"

### Portion Guidance
Inside the explanation card, append the portion guidance as a single-line note with a portion icon:
```
🍽️ Best eaten in small portions — watch sodium per serving.
```

## File Changes

| File | Change |
|---|---|
| `data/mockData.ts` | Add `confidence`, `portionGuidance` to `ScanResultData` |
| `services/scanService.ts` | Add `confidence`, `portionGuidance` to `ScanAiResponse`, pass through in `buildScanResultFromAiResponse()` |
| `services/supabaseService.ts` | Add `portion_guidance` to `ScanLogRow` and `insertScanLog()` |
| `supabase/functions/scan-ai/index.ts` | Add `confidence` and `portionGuidance` to the JSON schema in system instruction |
| `app/scan-preview.tsx` | Add confidence indicator in verdict header, portion guidance in explanation card |

## Backward Compatibility

- If `confidence` is missing (existing scans), no indicator is shown — result renders as today
- If `portionGuidance` is missing, no portion line is shown
- All existing types remain compatible
