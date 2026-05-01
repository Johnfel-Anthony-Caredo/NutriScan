/**
 * NutriScan Spacing Scale
 *
 * Generous spacing for clarity and accessibility.
 * Used for padding, margins, and gaps across all components.
 */

export const spacing = {
  /** 4px — tight inline spacing */
  xs: 4,
  /** 8px — compact element gaps */
  sm: 8,
  /** 12px — standard inner padding */
  md: 12,
  /** 16px — default component padding */
  lg: 16,
  /** 20px — section inner padding */
  xl: 20,
  /** 24px — generous component gaps */
  '2xl': 24,
  /** 32px — section spacing */
  '3xl': 32,
  /** 40px — major section breaks */
  '4xl': 40,
  /** 48px — screen-level padding */
  '5xl': 48,
} as const;

/** Screen horizontal padding — used on every screen wrapper */
export const SCREEN_PADDING_H = spacing.xl;
