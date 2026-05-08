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

/** Screen horizontal padding — 16px on every screen */
export const SCREEN_PADDING_H = spacing.md;
