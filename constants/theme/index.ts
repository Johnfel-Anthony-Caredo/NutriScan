/**
 * NutriScan Theme — Barrel Export
 *
 * Import this file to access every design token:
 *   import { lightTheme, darkTheme } from '@/constants/theme';
 */

export { lightColors, darkColors, teal, safe, caution, avoid, neutral } from './colors';
export type { ThemeColors } from './colors';
export { fontSizes, fontWeights, lineHeights, textStyles } from './typography';
export { spacing, SCREEN_PADDING_H } from './spacing';
export { radius } from './radius';
export { shadows } from './shadows';

import { lightColors, darkColors, type ThemeColors } from './colors';
import { fontSizes, fontWeights, lineHeights, textStyles } from './typography';
import { spacing, SCREEN_PADDING_H } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';

export interface AppTheme {
  dark: boolean;
  colors: ThemeColors;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  screenPaddingH: number;
  radius: typeof radius;
  shadows: typeof shadows;
}

export const lightTheme: AppTheme = {
  dark: false,
  colors: lightColors,
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
  spacing,
  screenPaddingH: SCREEN_PADDING_H,
  radius,
  shadows,
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: darkColors,
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
  spacing,
  screenPaddingH: SCREEN_PADDING_H,
  radius,
  shadows,
};
