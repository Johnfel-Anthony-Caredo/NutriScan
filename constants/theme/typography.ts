/**
 * NutriScan Typography Tokens
 *
 * Body text uses 16px minimum for readability — critical for older
 * or medically-sensitive users. Line heights are generous to aid
 * scanning and comprehension.
 */

export const fontSizes = {
  xs: 12,
  sm: 14,
  body: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
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
} as const;

/**
 * Pre-composed text styles for quick usage.
 * Use these via `theme.textStyles.heading` etc.
 */
export const textStyles = {
  h1: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.semibold,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.regular,
  },
  bodyMedium: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.medium,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },
  label: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.medium,
  },
  small: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
} as const;
