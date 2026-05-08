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
