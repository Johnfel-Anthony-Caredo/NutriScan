/**
 * useTheme — returns the single light-mode theme.
 *
 * Neo-brutalist redesign is light-mode only for maximum contrast.
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.colors.background }}>
 */

import { theme, type AppTheme } from '@/constants/theme';

export function useTheme(): AppTheme {
  return theme;
}
