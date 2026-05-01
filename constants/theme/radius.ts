/**
 * NutriScan Border Radius Tokens
 *
 * Slightly rounded corners keep the UI feeling friendly
 * without being overly playful.
 */

export const radius = {
  /** 4px — very subtle rounding */
  xs: 4,
  /** 8px — inputs and small cards */
  sm: 8,
  /** 12px — standard cards */
  md: 12,
  /** 16px — prominent cards and sheets */
  lg: 16,
  /** 20px — modals and large surfaces */
  xl: 20,
  /** 9999px — pills and circular elements */
  full: 9999,
} as const;
