/**
 * NutriScan Theme — Barrel Export
 *
 * Import this file to access every design token:
 *   import { theme } from '@/constants/theme';
 */

export { colors, teal, medicalTeal, medicalTealDark, medicalTealLight, deepBlack, mintTint, safe, caution, avoid, warningCoral, cautionYellow, successGreen, neutral } from './colors';
export type { ThemeColors } from './colors';
export { fontFamilies, fontSizes, fontWeights, lineHeights, textStyles } from './typography';
export { spacing, SCREEN_PADDING_H } from './spacing';
export { radius } from './radius';
export { shadows } from './shadows';
export { animations } from './animations';

import { colors, type ThemeColors } from './colors';
import { fontFamilies, fontSizes, fontWeights, lineHeights, textStyles } from './typography';
import { spacing, SCREEN_PADDING_H } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animations } from './animations';

export interface AppTheme {
  dark: false;
  colors: ThemeColors;
  fontFamilies: typeof fontFamilies;
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
  fontFamilies,
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
