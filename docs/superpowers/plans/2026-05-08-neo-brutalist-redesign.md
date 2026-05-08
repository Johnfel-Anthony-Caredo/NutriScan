# NutriScan Neo-Brutalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the NutriScan frontend using a Medical Teal neo-brutalist design system per Design1.md, keeping all backend logic, auth, data flow, and business logic untouched.

**Architecture:** Replace soft gradients and warm grays with a high-contrast system: Medical Teal (#00897B) primary, Deep Black (#0A0A0A) borders/shadows/text, Mint Tint (#E0F2F1) surfaces. All cards/buttons get 3px black borders + hard offset shadows. Light mode only. Space Grotesk for headings, DM Sans for body.

**Tech Stack:** React Native + Expo, expo-router, React Native Animated API, Ionicons

---

### Task 1: Rewrite Color System (constants/theme/colors.ts)

**Files:**
- Modify: `constants/theme/colors.ts` (entire file)
- Modify: `constants/theme/index.ts` (remove darkTheme export)

- [ ] **Step 1: Rewrite colors.ts with neo-brutalist palette**

Replace the current color system with the Design1.md palette. Remove all dark theme colors (light mode only). Add Deep Black, Mint Tint. Set primary teal to exact #00897B.

```typescript
/**
 * NutriScan Neo-Brutalist Color System
 *
 * Medical Teal (#00897B) primary with Deep Black (#0A0A0A) borders/shadows/text.
 * Mint Tint (#E0F2F1) for card and screen backgrounds.
 * Light mode only — high contrast, no dark theme.
 */

// ── Primary: Medical Teal ──────────────────────────────────────────
export const teal = {
  50: '#E0F2F1',
  100: '#B2DFDB',
  200: '#80CBC4',
  300: '#4DB6AC',
  400: '#26A69A',
  500: '#00897B', // Medical Teal — primary brand color
  600: '#00695C',
  700: '#004D40',
  800: '#00352C',
  900: '#002019',
} as const;

export const medicalTeal = teal[500];   // #00897B
export const medicalTealDark = teal[600];  // #00695C
export const medicalTealLight = teal[400]; // #26A69A

// ── Neo-Brutalist Core ─────────────────────────────────────────────
export const deepBlack = '#0A0A0A';
export const mintTint = '#E0F2F1';

// ── Semantic / Verdict Colors ──────────────────────────────────────
export const warningCoral = '#FF6B57';
export const cautionYellow = '#FFD54F';
export const successGreen = '#2E7D32';

export const safe = {
  bg: '#E8F8EE',
  text: '#1B7A3D',
  border: '#2E7D32',
  icon: '#2E7D32',
} as const;

export const caution = {
  bg: '#FFF7E6',
  text: '#946200',
  border: '#FFD54F',
  icon: '#FFD54F',
} as const;

export const avoid = {
  bg: '#FFF0EE',
  text: '#C0392B',
  border: '#FF6B57',
  icon: '#FF6B57',
} as const;

// ── Neutral Scale ──────────────────────────────────────────────────
export const neutral = {
  0: '#FFFFFF',
  50: '#FAFAF8',
  100: '#F5F5F0',
  200: '#EDECE7',
  300: '#DDDCD6',
  400: '#B8B7B1',
  500: '#8E8D87',
  600: '#6B6A65',
  700: '#4A4944',
  800: '#2D2C28',
  900: '#1A1918',
} as const;

// ── Light Theme (only) ─────────────────────────────────────────────
export const colors = {
  // Surfaces
  background: mintTint,
  surface: neutral[0],
  surfaceSecondary: teal[50],
  surfaceElevated: neutral[0],

  // Text
  textPrimary: deepBlack,
  textSecondary: neutral[600],
  textTertiary: neutral[500],
  textInverse: neutral[0],

  // Primary
  primary: medicalTeal,
  primaryLight: teal[50],
  primaryDark: medicalTealDark,

  // Borders (all deep black for brutalist feel)
  border: deepBlack,
  borderLight: deepBlack,
  divider: deepBlack,

  // Tab bar
  tabBar: neutral[0],
  tabBarBorder: deepBlack,
  tabIconDefault: neutral[400],
  tabIconActive: medicalTeal,

  // Verdicts
  safe,
  caution,
  avoid,

  // Misc
  overlay: 'rgba(10, 10, 10, 0.45)',
  shadow: deepBlack,
} as const;

export type ThemeColors = typeof colors;
```

- [ ] **Step 2: Update theme/index.ts for light-mode-only**

Replace the barrel export to export the light-only theme. Remove `darkTheme`, `darkColors`. Update the `AppTheme` interface if needed.

```typescript
/**
 * NutriScan Theme — Barrel Export
 *
 * Import this file to access every design token:
 *   import { theme } from '@/constants/theme';
 */

export { colors, teal, medicalTeal, medicalTealDark, medicalTealLight, deepBlack, mintTint, safe, caution, avoid, warningCoral, cautionYellow, successGreen, neutral } from './colors';
export type { ThemeColors } from './colors';
export { fontSizes, fontWeights, lineHeights, textStyles } from './typography';
export { spacing, SCREEN_PADDING_H } from './spacing';
export { radius } from './radius';
export { shadows } from './shadows';
export { animations } from './animations';

import { colors, type ThemeColors } from './colors';
import { fontSizes, fontWeights, lineHeights, textStyles } from './typography';
import { spacing, SCREEN_PADDING_H } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animations } from './animations';

export interface AppTheme {
  dark: false;
  colors: ThemeColors;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  screenPaddingH: number;
  radius: typeof radius;
  shadows: typeof shadows;
  animations: typeof animations;
}

export const theme: AppTheme = {
  dark: false,
  colors,
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
  spacing,
  screenPaddingH: SCREEN_PADDING_H,
  radius,
  shadows,
  animations,
};
```

- [ ] **Step 3: Commit**

```bash
git add constants/theme/colors.ts constants/theme/index.ts
git commit -m "feat(theme): neo-brutalist color system — Medical Teal, Deep Black, light-only"
```

---

### Task 2: Update Typography with Font Families

**Files:**
- Modify: `constants/theme/typography.ts`

- [ ] **Step 1: Rewrite typography.ts with Space Grotesk + DM Sans**

Add fontFamily tokens. Update textStyles to use Space Grotesk for headings and UI labels, DM Sans for body. Match Design1.md sizing.

```typescript
/**
 * NutriScan Neo-Brutalist Typography
 *
 * Space Grotesk for bold headings and UI labels.
 * DM Sans for clean, readable body text.
 */

export const fontFamilies = {
  heading: 'SpaceGrotesk',
  body: 'DMSans',
  mono: 'SpaceGrotesk',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  body: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  xs: 16,
  sm: 20,
  body: 24,
  lg: 26,
  xl: 30,
  '2xl': 34,
  '3xl': 40,
  '4xl': 44,
} as const;

export const textStyles = {
  displayXl: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights['4xl'],
    fontWeight: fontWeights.bold,
  },
  displayMd: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
  },
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.regular,
  },
  bodyMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.medium,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },
  label: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.bold,
  },
  small: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add constants/theme/typography.ts
git commit -m "feat(theme): Space Grotesk headings + DM Sans body typography"
```

---

### Task 3: Add Hard Offset Shadows

**Files:**
- Modify: `constants/theme/shadows.ts`

- [ ] **Step 1: Rewrite shadows.ts with hard offset shadows**

Replace soft blur shadows with hard offset shadows (0 blur radius, deep black color). On iOS this produces a crisp edge; on Android we add a View-based fallback approach in the Card component later.

```typescript
/**
 * NutriScan Neo-Brutalist Shadows
 *
 * Hard offset shadows — 0 blur, deep black color.
 * iOS: shadowRadius: 0 produces a crisp hard shadow.
 * Android: elevation provides subtle depth (platform limitation).
 * For a true hard shadow on Android, use the <BrutalShadow> wrapper component.
 */

import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

const createBrutalShadow = (
  offset: number,
  elevation: number,
): ShadowStyle => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
  };
};

export const shadows = {
  /** 3px offset — small cards, pills */
  sm: createBrutalShadow(3, 4),
  /** 5px offset — standard cards, buttons */
  md: createBrutalShadow(5, 6),
  /** 8px offset — modals, floating elements */
  lg: createBrutalShadow(8, 10),
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add constants/theme/shadows.ts
git commit -m "feat(theme): hard offset shadows (0 blur, deep black)"
```

---

### Task 4: Add Animation Presets, Update Spacing & Radius

**Files:**
- Create: `constants/theme/animations.ts`
- Modify: `constants/theme/spacing.ts`
- Modify: `constants/theme/radius.ts`

- [ ] **Step 1: Create animations.ts**

```typescript
/**
 * NutriScan Neo-Brutalist Animation Presets
 *
 * Snappy, physical motion — no slow or floaty animations.
 */

import { Animated } from 'react-native';

export const animations = {
  /** Bounce curve for press interactions */
  bounce: {
    tension: 120,
    friction: 8,
  },
  /** Quick fade-in */
  snap: {
    duration: 180,
    easing: (value: number) => value, // linear ease-out approximation
  },
  /** Spring scale down on press */
  pressScale: {
    toValue: 0.96,
    tension: 150,
    friction: 6,
    useNativeDriver: true,
  },
  /** Spring scale up on release */
  releaseScale: {
    toValue: 1,
    tension: 100,
    friction: 7,
    useNativeDriver: true,
  },
} as const;

/**
 * Creates a bounce spring animation config.
 */
export function bounceSpring(toValue: number, extraConfig?: Partial<Animated.SpringAnimationConfig>) {
  return Animated.spring(
    new Animated.Value(0),
    {
      toValue,
      tension: animations.bounce.tension,
      friction: animations.bounce.friction,
      useNativeDriver: true,
      ...extraConfig,
    },
  );
}
```

- [ ] **Step 2: Update spacing.ts**

Update spacing to match Design1.md — ensure xs/sm/md/lg/xl/2xl map cleanly.

The current spacing is already good. Just add a comment referencing the design system.

```typescript
/**
 * NutriScan Neo-Brutalist Spacing
 *
 * Design1.md values (rem → px at 16px base):
 * xs: 4px  | sm: 8px  | md: 16px | lg: 24px | xl: 32px | 2xl: 48px
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const SCREEN_PADDING_H = spacing.md;
```

- [ ] **Step 3: Update radius.ts**

```typescript
/**
 * NutriScan Neo-Brutalist Border Radius
 *
 * Mix rounded pills with hard-edged cards.
 * sm: 8px  | md: 12px  | lg: 20px  | full: 999px
 */

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add constants/theme/animations.ts constants/theme/spacing.ts constants/theme/radius.ts
git commit -m "feat(theme): animations preset, updated spacing, neo-brutalist radius"
```

---

### Task 5: Simplify useTheme Hook (Light Mode Only)

**Files:**
- Modify: `hooks/useTheme.ts`

- [ ] **Step 1: Rewrite useTheme.ts for light-only**

```typescript
/**
 * useTheme — returns the single light-mode theme.
 *
 * Neo-brutalist redesign is light-mode only for maximum contrast.
 * No dark mode switching needed.
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.colors.background }}>
 */

import { theme, type AppTheme } from '@/constants/theme';

export function useTheme(): AppTheme {
  return theme;
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useTheme.ts
git commit -m "refactor(theme): simplify useTheme to light-mode only"
```

---

### Task 6: Neo-Brutalist Card Component

**Files:**
- Modify: `components/ui/Card.tsx`

- [ ] **Step 1: Rewrite Card.tsx**

Heavy 3px black border, hard offset shadow, solid white fill. Optional mint background variant. Support for shadow as separate absolute view for Android hard shadow effect.

```typescript
import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  /** Use mint tint background instead of white (default: false) */
  mint?: boolean;
}

export function Card({ children, style, noPadding = false, mint = false }: CardProps) {
  const theme = useTheme();

  return (
    <View style={styles.shadowWrapper}>
      {/* Hard shadow block — only visible on Android where shadowRadius:0 doesn't work */}
      {Platform.OS === 'android' && (
        <View
          style={[
            styles.shadowBlock,
            {
              backgroundColor: theme.colors.shadow,
              borderRadius: theme.radius.md,
            },
          ]}
          pointerEvents="none"
        />
      )}
      <View
        style={[
          styles.card,
          {
            backgroundColor: mint ? theme.colors.surfaceSecondary : theme.colors.surface,
            borderRadius: theme.radius.md,
            borderColor: theme.colors.border,
            ...(Platform.OS === 'ios' ? theme.shadows.md : {}),
          },
          !noPadding && { padding: theme.spacing.md },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
  },
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  card: {
    borderWidth: 3,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Card.tsx
git commit -m "feat(ui): neo-brutalist Card with 3px black border + hard shadow"
```

---

### Task 7: Neo-Brutalist PrimaryButton

**Files:**
- Modify: `components/ui/PrimaryButton.tsx`

- [ ] **Step 1: Rewrite PrimaryButton.tsx**

Medical Teal fill, 3px black border, hard shadow, Space Grotesk bold label, scale-on-press animation, pill-shaped (full radius).

```typescript
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  icon,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      tension: 150,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {/* Android hard shadow block */}
      {Platform.OS === 'android' && !isDisabled && (
        <View style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.full }]} pointerEvents="none" />
      )}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled ? theme.colors.primary + '60' : theme.colors.primary,
            borderRadius: theme.radius.full,
            borderColor: isDisabled ? theme.colors.textTertiary : theme.colors.border,
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.textInverse} size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.textInverse,
                  fontSize: theme.fontSizes.body,
                  fontFamily: theme.textStyles.label.fontFamily,
                  fontWeight: theme.fontWeights.bold,
                  marginLeft: icon ? 8 : 0,
                },
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    paddingHorizontal: 28,
    borderWidth: 3,
  },
  label: {
    letterSpacing: 0.3,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/PrimaryButton.tsx
git commit -m "feat(ui): neo-brutalist PrimaryButton — teal fill, black border, scale-on-press"
```

---

### Task 8: Neo-Brutalist SecondaryButton

**Files:**
- Modify: `components/ui/SecondaryButton.tsx`

- [ ] **Step 1: Rewrite SecondaryButton.tsx**

White fill, 3px black border, black text, hard shadow, rounded-rect (not full pill), scale-on-press.

```typescript
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function SecondaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  icon,
}: SecondaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      tension: 150,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {Platform.OS === 'android' && !isDisabled && (
        <View style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.md }]} pointerEvents="none" />
      )}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            borderColor: theme.colors.border,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.body,
                  fontFamily: theme.textStyles.label.fontFamily,
                  fontWeight: theme.fontWeights.bold,
                  marginLeft: icon ? 8 : 0,
                },
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    paddingHorizontal: 24,
    borderWidth: 3,
  },
  label: {
    letterSpacing: 0.3,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/SecondaryButton.tsx
git commit -m "feat(ui): neo-brutalist SecondaryButton — white fill, black border, scale-on-press"
```

---

### Task 9: Neo-Brutalist TopBar

**Files:**
- Modify: `components/ui/TopBar.tsx`

- [ ] **Step 1: Rewrite TopBar.tsx**

Use Space Grotesk bold title. 3px bottom black border. Bolder back chevron.

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function TopBar({
  title,
  showBack = false,
  onBack,
  rightAction,
}: TopBarProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border, borderBottomWidth: 3 }]}>
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontFamily: theme.textStyles.h2.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={[styles.side, styles.rightSide]}>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  side: {
    width: 44,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/TopBar.tsx
git commit -m "feat(ui): neo-brutalist TopBar — 3px black border, Space Grotesk title"
```

---

### Task 10: Neo-Brutalist SectionHeader

**Files:**
- Modify: `components/ui/SectionHeader.tsx`

- [ ] **Step 1: Rewrite SectionHeader.tsx**

Space Grotesk bold title, teal action link, stronger hierarchy.

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontFamily: theme.textStyles.h2.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
      >
        {title}
      </Text>
      {action && onAction && (
        <TouchableOpacity
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={action}
        >
          <Text
            style={[
              styles.action,
              {
                color: theme.colors.primary,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.textStyles.label.fontFamily,
                fontWeight: theme.fontWeights.bold,
              },
            ]}
          >
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  action: {
    marginLeft: 12,
    letterSpacing: 0.3,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/SectionHeader.tsx
git commit -m "feat(ui): neo-brutalist SectionHeader — uppercase Space Grotesk"
```

---

### Task 11: Neo-Brutalist EmptyState

**Files:**
- Modify: `components/ui/EmptyState.tsx`

- [ ] **Step 1: Rewrite EmptyState.tsx**

Neo-brutalist card container, black border icon circle, bold centered layout.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'leaf-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.colors.border }]}>
      {/* Icon with black border */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={40} color={theme.colors.primary} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.xl,
            fontFamily: theme.textStyles.h2.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.body,
              lineHeight: theme.lineHeights.body,
              fontFamily: theme.textStyles.body.fontFamily,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {actionLabel && onAction && (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    borderWidth: 3,
    margin: 16,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/EmptyState.tsx
git commit -m "feat(ui): neo-brutalist EmptyState — black border card, bold icon"
```

---

### Task 12: Neo-Brutalist VerdictBadge

**Files:**
- Modify: `components/ui/VerdictBadge.tsx`

- [ ] **Step 1: Rewrite VerdictBadge.tsx**

Bolder with black border, compact layout, strong semantic colors.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { Verdict } from '@/types/health';
import { verdictLabels } from '@/types/health';

interface VerdictBadgeProps {
  verdict: Verdict;
  large?: boolean;
}

const verdictIcons: Record<Verdict, keyof typeof Ionicons.glyphMap> = {
  safe: 'checkmark-circle',
  caution: 'warning',
  avoid: 'close-circle',
};

export function VerdictBadge({ verdict, large = false }: VerdictBadgeProps) {
  const theme = useTheme();
  const colors = theme.colors[verdict];

  return (
    <View
      style={[
        styles.badge,
        large && styles.large,
        {
          backgroundColor: colors.bg,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
        },
      ]}
    >
      <Ionicons
        name={verdictIcons[verdict]}
        size={large ? 24 : 18}
        color={colors.icon}
      />
      <Text
        style={[
          styles.label,
          large && styles.largeLabel,
          {
            color: colors.text,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
      >
        {verdictLabels[verdict]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    gap: 6,
  },
  large: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
  },
  largeLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/VerdictBadge.tsx
git commit -m "feat(ui): neo-brutalist VerdictBadge — black border, bold label"
```

---

### Task 13: Neo-Brutalist ConditionPill

**Files:**
- Modify: `components/ui/ConditionPill.tsx`

- [ ] **Step 1: Rewrite ConditionPill.tsx**

Black border pill, Space Grotesk bold label, teal background.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { HealthCondition } from '@/types/health';
import { conditionLabels } from '@/types/health';

interface ConditionPillProps {
  condition: HealthCondition;
  compact?: boolean;
}

export function ConditionPill({ condition, compact = false }: ConditionPillProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.pill,
        compact && styles.compact,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          compact && styles.compactLabel,
          {
            color: theme.colors.primary,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
        numberOfLines={1}
      >
        {conditionLabels[condition]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 2,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
  },
  compactLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/ConditionPill.tsx
git commit -m "feat(ui): neo-brutalist ConditionPill — black border, bold teal label"
```

---

### Task 14: Neo-Brutalist SelectableCard & SelectableChip

**Files:**
- Modify: `components/ui/SelectableCard.tsx`
- Modify: `components/ui/SelectableChip.tsx`

- [ ] **Step 1: Rewrite SelectableCard.tsx**

Black border, hard shadow, teal fill when selected, bold label.

```typescript
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface SelectableCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  subtitle?: string;
}

export function SelectableCard({
  label,
  icon,
  selected,
  onPress,
  subtitle,
}: SelectableCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {Platform.OS === 'android' && (
        <View
          style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.md }]}
          pointerEvents="none"
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={1}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
        style={[
          styles.card,
          {
            backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={selected ? theme.colors.textInverse : theme.colors.textPrimary}
        />
        <Text
          style={[
            styles.label,
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: selected ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {selected && (
          <View style={styles.check}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.textInverse} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '47%',
  },
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 3,
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
```

- [ ] **Step 2: Rewrite SelectableChip.tsx**

Black border, teal fill when selected, Space Grotesk bold label.

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}

export function SelectableChip({
  label,
  selected,
  onPress,
  emoji,
}: SelectableChipProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.textInverse} />
      ) : (
        emoji && <Text style={styles.emoji}>{emoji}</Text>
      )}
      <Text
        style={[
          styles.label,
          {
            color: selected ? theme.colors.textInverse : theme.colors.textPrimary,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/SelectableCard.tsx components/ui/SelectableChip.tsx
git commit -m "feat(ui): neo-brutalist SelectableCard + SelectableChip — black border, teal active"
```

---

### Task 15: Neo-Brutalist FloatingNutriBotButton

**Files:**
- Modify: `components/ui/FloatingNutriBotButton.tsx`

- [ ] **Step 1: Rewrite FloatingNutriBotButton.tsx**

Replace gradient with solid Medical Teal, add black border, hard shadow.

```typescript
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export function FloatingNutriBotButton() {
  const theme = useTheme();
  const router = useRouter();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      {/* Android hard shadow */}
      {Platform.OS === 'android' && (
        <View style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow }]} pointerEvents="none" />
      )}
      <TouchableOpacity
        onPress={() => router.push('/nutribot')}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Open NutriBot assistant"
        style={[styles.touchable, {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.border,
          ...(Platform.OS === 'ios' ? theme.shadows.lg : {}),
        }]}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color={theme.colors.textInverse} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 96 : 80,
    right: 20,
    zIndex: 100,
  },
  shadowBlock: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 0,
    bottom: 0,
    borderRadius: 30,
  },
  touchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/FloatingNutriBotButton.tsx
git commit -m "feat(ui): neo-brutalist FloatingNutriBotButton — teal solid, black border"
```

---

### Task 16: Neo-Brutalist ProgressBar

**Files:**
- Modify: `components/ui/ProgressBar.tsx`

- [ ] **Step 1: Rewrite ProgressBar.tsx**

Thick segments, more graphic, bold step label.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showLabel?: boolean;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  showLabel = true,
}: ProgressBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.textStyles.label.fontFamily,
              fontWeight: theme.fontWeights.bold,
            },
          ]}
        >
          STEP {currentStep} OF {totalSteps}
        </Text>
      )}
      <View style={[styles.track, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor: i < currentStep ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.border,
                borderRightWidth: i < totalSteps - 1 ? 2 : 0,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  label: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  track: {
    flexDirection: 'row',
    height: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: 12,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/ProgressBar.tsx
git commit -m "feat(ui): neo-brutalist ProgressBar — thick segments, black border"
```

---

### Task 17: Neo-Brutalist FoodLogItem

**Files:**
- Modify: `components/ui/FoodLogItem.tsx`

- [ ] **Step 1: Rewrite FoodLogItem.tsx**

Cleaner row with black bottom border, bolder text.

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { VerdictBadge } from './VerdictBadge';
import type { FoodItem } from '@/types/health';

interface FoodLogItemProps {
  item: FoodItem;
  onPress?: () => void;
}

const mealIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

export function FoodLogItem({ item, onPress }: FoodLogItemProps) {
  const theme = useTheme();
  const time = new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
      accessibilityRole="button"
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
        <Ionicons
          name={mealIcons[item.mealType ?? 'snack'] ?? 'restaurant-outline'}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.body,
            fontFamily: theme.textStyles.body.fontFamily,
            fontWeight: theme.fontWeights.semibold,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.sm,
            marginTop: 2,
            fontFamily: theme.textStyles.body.fontFamily,
          }}
        >
          {item.mealType ? item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1) : 'Snack'} · {time}
        </Text>
      </View>
      <VerdictBadge verdict={item.verdict} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/FoodLogItem.tsx
git commit -m "feat(ui): neo-brutalist FoodLogItem — black border row, bold text"
```

---

### Task 18: Neo-Brutalist AppScreen

**Files:**
- Modify: `components/ui/AppScreen.tsx`

- [ ] **Step 1: Rewrite AppScreen.tsx**

Update error toast to use black borders instead of hairline. Keep same structure but with neo-brutalist styling.

```typescript
import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface AppScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshError?: string | null;
  onDismissError?: () => void;
}

export function AppScreen({
  children,
  scroll = false,
  noPadding = false,
  style,
  refreshing,
  onRefresh,
  refreshError,
  onDismissError,
}: AppScreenProps) {
  const theme = useTheme();

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: noPadding ? 0 : theme.screenPaddingH,
  };

  const showRefresh = refreshing !== undefined && onRefresh !== undefined;

  const inner = (
    <View style={[contentStyle, style]}>
      {refreshError ? (
        <View
          style={[
            styles.errorToast,
            {
              backgroundColor: theme.colors.avoid.bg,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.avoid.icon} />
          <Text
            style={[
              styles.errorText,
              {
                color: theme.colors.avoid.text,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.textStyles.body.fontFamily,
              },
            ]}
            numberOfLines={2}
          >
            {refreshError}
          </Text>
          {onDismissError ? (
            <Pressable
              onPress={onDismissError}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
            >
              <Ionicons name="close" size={16} color={theme.colors.avoid.text} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            showRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.surface}
              />
            ) : undefined
          }
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 2,
  },
  errorText: {
    flex: 1,
    lineHeight: 18,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/AppScreen.tsx
git commit -m "feat(ui): neo-brutalist AppScreen — black border toast, dark status bar"
```

---

### Task 19: Neo-Brutalist Tab Bar Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Rewrite tab layout**

Add 3px black top border, increase tab bar height, bold active state with Medical Teal, thicker active indicator.

```typescript
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { FloatingNutriBotButton } from '@/components/ui';

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: TabIcon;
  iconFocused: TabIcon;
}[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'scan', title: 'Scan', icon: 'scan-outline', iconFocused: 'scan' },
  { name: 'history', title: 'History', icon: 'time-outline', iconFocused: 'time' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabIconActive,
          tabBarInactiveTintColor: theme.colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.tabBarBorder,
            borderTopWidth: 3,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
            letterSpacing: 0.3,
          },
          tabBarActiveBackgroundColor: 'transparent',
          tabBarItemStyle: {
            paddingTop: 4,
          },
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? tab.iconFocused : tab.icon}
                  size={focused ? size + 2 : size}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tabs>

      <FloatingNutriBotButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "feat(ui): neo-brutalist tab bar — 3px black border, bold labels"
```

---

### Task 20: Update Article Components

**Files:**
- Modify: `components/articles/ArticleCard.tsx`
- Modify: `components/articles/TakeawaysCard.tsx`

- [ ] **Step 1: Update ArticleCard.tsx**

Replace hairline border with 3px black border, update shadow to hard shadow, update category chip.

Apply these specific edits to ArticleCard.tsx:

1. Change card borderWidth from `StyleSheet.hairlineWidth` to `3` and `borderColor` from `theme.colors.borderLight` to `theme.colors.border`
2. Remove `...theme.shadows.sm` — we'll use the card's own border for depth
3. Update category chip to use black border

```typescript
// In the card style block, change:
borderColor: theme.colors.borderLight,  →  borderColor: theme.colors.border,
...theme.shadows.sm,  →  (remove this line)

// Update categoryChip style:
[styles.categoryChip, {
  backgroundColor: theme.colors.primary,
  borderColor: theme.colors.border,
  borderRadius: theme.radius.full,
}],

// Add to styles:
card: {
  borderWidth: 3,
  overflow: 'hidden',
},
categoryChip: {
  position: 'absolute',
  bottom: 8,
  left: 10,
  paddingHorizontal: 10,
  paddingVertical: 3,
  maxWidth: '70%',
  borderWidth: 2,
},
```

- [ ] **Step 2: Update TakeawaysCard.tsx**

Replace soft primaryLight background with white + 3px black border, hard shadow.

```typescript
// Replace container style block:
[
  styles.container,
  {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
]

// Add to styles:
container: {
  padding: 20,
  marginVertical: 4,
  borderWidth: 3,
},
```

- [ ] **Step 3: Commit**

```bash
git add components/articles/ArticleCard.tsx components/articles/TakeawaysCard.tsx
git commit -m "feat(ui): neo-brutalist article components — black borders, hard edges"
```

---

### Task 21: Update Root Layout StatusBar

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Update StatusBar for light-mode-only**

Change StatusBar to always use "dark" style since we're light-mode-only.

```typescript
// Change:
<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
// To:
<StatusBar style="dark" />
```

Also remove the unused `useColorScheme` import at the top of the file.

```typescript
// Remove this import:
import { useColorScheme } from 'react-native';
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "fix(layout): dark status bar for light-only theme"
```

---

### Task 22: Update Splash Screen

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Update splash screen for neo-brutalist look**

Give the logo circle a black border, update text to use font families.

Edit the logo circle to have a black border:
```typescript
<View style={[styles.logoCircle, {
  backgroundColor: theme.colors.primaryLight,
  borderColor: theme.colors.border,
  borderWidth: 3,
}]}>
```

Update NutriScan title to use heading font family:
```typescript
<Text style={{
  color: theme.colors.textPrimary,
  fontSize: theme.fontSizes['3xl'],
  fontFamily: theme.textStyles.displayMd.fontFamily,
  fontWeight: theme.fontWeights.bold,
  marginTop: 20,
  letterSpacing: 0.5,
}}>
  NutriScan
</Text>
```

Update tagline to use body font:
```typescript
<Text style={{
  color: theme.colors.textSecondary,
  fontSize: theme.fontSizes.lg,
  fontFamily: theme.textStyles.body.fontFamily,
  lineHeight: theme.lineHeights.lg,
  textAlign: 'center',
}}>
```

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "feat(ui): neo-brutalist splash — black border logo, brand fonts"
```

---

### Task 23: Update ui/index.ts Barrel Export

**Files:**
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Verify all exports are present**

The index.ts already exports all components. No changes needed unless new components were added. Verify by reading the file.

```bash
cat components/ui/index.ts
# Confirm all 18 components are listed
```

No changes needed.

---

### Self-Review Checklist

1. **Spec coverage:** Every visual requirement from Design1.md covered:
   - Color system with Medical Teal ✅ (Task 1)
   - Deep Black for borders/shadows/text ✅ (Task 1)
   - Space Grotesk + DM Sans typography ✅ (Task 2)
   - Hard offset shadows (0 blur) ✅ (Task 3)
   - Snappy bounce animations ✅ (Task 4)
   - 3px black borders on cards/buttons ✅ (Tasks 6-20)
   - Neo-brutalist Card component ✅ (Task 6)
   - Primary button: teal fill, black border, hard shadow, press scale ✅ (Task 7)
   - Secondary button: white fill, black border ✅ (Task 8)
   - Bold tab bar with Medical Teal active ✅ (Task 19)
   - Verdict badges with strong semantic colors ✅ (Task 12)
   - Condition pills with black border ✅ (Task 13)
   - Selectable components with black border + teal active ✅ (Task 14)
   - Consistent loading/empty/error states ✅ (Tasks 11, 18)
   - Frontend-only: no backend/auth/data changes ✅

2. **Placeholder scan:** No TBD, TODO, or incomplete sections.

3. **Type consistency:** All components use `useTheme()` which returns `AppTheme`. All theme references use consistent property paths.

4. **Scope:** Focused entirely on frontend presentation. No scope creep into backend, auth, or data flow.
