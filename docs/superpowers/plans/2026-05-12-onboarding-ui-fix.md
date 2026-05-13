# Onboarding UI/UX Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove skip buttons, enforce required personalization, and fix spacing/UI consistency across all 5 onboarding screens.

**Architecture:** Direct edits to existing screen components. No new files, no new components. Each screen is self-contained, changes are cosmetic and structural (remove skip logic, apply theme spacing/textStyles consistently).

**Tech Stack:** React Native, Expo Router, custom theme (neo-brutalist), inline/stylesheets

---

### Task 1: Welcome Screen — Remove skip, fix layout

**Files:**
- Modify: `app/(onboarding)/welcome.tsx`

- [ ] **Step 1: Remove skip button and tertiary text, fix imports**

Remove the `SecondaryButton` import and the "Skip for Now" button + "You can always update" text. Update container to remove `justifyContent: 'space-between'`.

```tsx
// Before import
import { AppScreen, PrimaryButton, SecondaryButton } from '@/components/ui';
// After import
import { AppScreen, PrimaryButton } from '@/components/ui';

// Remove the entire actions block (lines 85-109):
// <View style={styles.actions}>
//   <PrimaryButton ... />
//   <SecondaryButton ... />   ← REMOVE
//   <Text ...>You can always...</Text>  ← REMOVE
// </View>
```

- [ ] **Step 2: Fix spacing and use theme textStyles**

Update container and text styles:
```tsx
// Container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 40,
  },
  // remove: actions: {},
});
```

Use theme textStyles for all text elements — replace inline fontFamily/fontSize/fontWeight/lineHeight with `theme.textStyles.displayMd` for the heading and `theme.textStyles.body` for description.

- [ ] **Step 3: Commit**

```bash
git add app/\(onboarding\)/welcome.tsx
git commit -m "fix(onboarding): remove skip button and fix welcome screen spacing"
```

---

### Task 2: Conditions Screen — Fix divider and spacing consistency

**Files:**
- Modify: `app/(onboarding)/conditions.tsx`

- [ ] **Step 1: Fix divider thickness and spacing**

Update the "or" divider to use 3px lines (match neo-brutalist border style). Standardize margin values using theme spacing tokens.

```tsx
dividerLine: {
  flex: 1,
  height: 3, // was 2
},
```

Replace hardcoded margins with theme spacing tokens where applicable. Use `theme.textStyles.h2` for title and `theme.textStyles.body` for description.

- [ ] **Step 2: Commit**

```bash
git add app/\(onboarding\)/conditions.tsx
git commit -m "fix(onboarding): fix conditions screen divider and spacing"
```

---

### Task 3: Goals Screen — Remove skip, fix button and spacing

**Files:**
- Modify: `app/(onboarding)/goals.tsx`

- [ ] **Step 1: Remove skip button and fix button label**

Remove `SecondaryButton` from imports. Remove the conditional skip button block. Change PrimaryButton label to always just "Continue".

```tsx
// Remove from import:
import { AppScreen, PrimaryButton, SelectableChip } from '@/components/ui';
// Note: SecondaryButton removed

// Remove lines 97-103:
// {selected.size === 0 && (
//   <SecondaryButton
//     label="Skip this step"
//     onPress={handleSkip}
//     style={{ marginTop: 12 }}
//   />
// )}

// Remove handleSkip function entirely (lines 49-52)

// Simplify PrimaryButton label:
<PrimaryButton
  label="Continue"
  onPress={handleContinue}
/>
```

- [ ] **Step 2: Fix spacing and use theme textStyles**

Use `theme.textStyles` for text elements. Add more marginBottom on chip area.

```tsx
chipWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 40, // was 32 — more breathing room before button
},
```

- [ ] **Step 3: Commit**

```bash
git add app/\(onboarding\)/goals.tsx
git commit -m "fix(onboarding): remove skip and fix goals screen UI"
```

---

### Task 4: NutriBot Assist — Remove duplicate progress bar, fix scroll/padding

**Files:**
- Modify: `app/(onboarding)/nutribot-assist.tsx`

- [ ] **Step 1: Remove custom progress bar in questions step**

Remove the custom `progressTrack`/`progressFill`/question counter in the questions step render. The layout's `ProgressBar` already covers this (nutribot-assist is in STEP_ORDER at index 3).

Remove this block (lines 179-184):
```tsx
{/* Progress */}
<View style={[styles.progressTrack, { ... }]}>
  <View style={[styles.progressFill, { ... }]} />
</View>
<Text style={{ ... }}>
  Question {currentQuestion + 1} of {QUESTIONS.length}
</Text>
```

- [ ] **Step 2: Make question step scrollable and fix padding**

Add `scroll` prop to AppScreen in the questions render. Fix padding to match other screens (consistent with `paddingTop: 16, paddingHorizontal: 20, paddingBottom: 40`).

Clean up unused styles (`progressTrack`, `progressFill`).

- [ ] **Step 3: Commit**

```bash
git add app/\(onboarding\)/nutribot-assist.tsx
git commit -m "fix(onboarding): remove duplicate progress bar, fix padding in nutribot assist"
```

---

### Task 5: Confirmation Screen — Minor spacing polish

**Files:**
- Modify: `app/(onboarding)/confirmation.tsx`

- [ ] **Step 1: Align margins with theme spacing tokens**

Replace hardcoded margin values with `theme.spacing` tokens. Change `actions` marginTop from 32 to `theme.spacing.xl` (32 — same value, but consistent pattern). Use `theme.textStyles` for text elements.

- [ ] **Step 2: Commit**

```bash
git add app/\(onboarding\)/confirmation.tsx
git commit -m "fix(onboarding): fix confirmation screen spacing consistency"
```
