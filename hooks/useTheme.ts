/**
 * useTheme — resolves light or dark theme based on device color scheme.
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.colors.background }}>
 */

import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/theme';

export function useTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
