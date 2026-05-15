# Add "Invalid" Verdict for Non-Edible Scans

**Date**: 2026-05-15
**Status**: Approved

## Problem

1. Non-edible items (computer mouse, wallet, etc.) are classified as `safe`/`caution`/`avoid` and their estimated calories are added to daily intake.
2. There is no verdict category for non-food items.

## Solution

Add `"invalid"` as a fourth verdict for non-edible scans.

### Verdict type change

- `Verdict` type extended: `'safe' | 'caution' | 'avoid' | 'invalid'`
- `verdictLabels['invalid']` = `'Invalid'`
- Invalid color palette: gray/neutral (gray bg `#F3F4F6`, text `#6B7280`, icon `#9CA3AF`, border `#D1D5DB`)
- Invalid icon: `help-circle-outline` (Ionicons)

### Behavior for invalid scans

**Result screen:**
- Verdict card shows gray styling, title "Not Edible", AI explanation of why it's not food
- No macros, no nutrients, no alternatives sections rendered
- Confidence badge still shown
- "Add to Food Log" button replaced with info banner: "This item was identified as non-edible and won't be added to your daily intake"
- "Scan Again" button remains

**Data persistence:**
- Invalid scans ARE saved to `scan_logs` in Supabase with `verdict: 'invalid'` and empty `nutrients` array
- They appear in recent scans and history

**Calorie/dashboard:**
- NutritionDashboard only counts non-invalid scans for calorie estimation
- Home screen filters out invalid scans before passing `todayScans` count

### AI prompt update (scan-ai edge function)

- Add `"invalid"` to the verdict enum in the system prompt
- Add rule: if the image is not food, return `"verdict": "invalid"` with `"foodName"` describing what was seen, empty `nutrients`, and explanation of why it's not edible

### Files changed

| File | Change |
|------|--------|
| `types/health.ts` | Add `'invalid'` to `Verdict`, add label |
| `constants/theme/colors.ts` | Add `invalid` color palette |
| `components/ui/VerdictBadge.tsx` | Add invalid icon + color |
| `app/scan-result.tsx` | Invalid verdict styling, hide macros/nutrients/log button |
| `app/(tabs)/index.tsx` | Filter invalid from NutritionDashboard count, add invalid to today's overview |
| `components/ui/WeeklyChart.tsx` | Handle invalid in chart data |
| `supabase/functions/scan-ai/index.ts` | Update prompt with `"invalid"` verdict + non-food rule |
| `data/mockData.ts` | Update `WeeklySummary` interface |
