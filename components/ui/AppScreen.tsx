/**
 * AppScreen — the base screen wrapper for every NutriScan screen.
 *
 * Provides:
 * - SafeAreaView with theme background
 * - Optional ScrollView behavior
 * - Consistent horizontal padding
 * - StatusBar theming
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';

interface AppScreenProps {
  children: React.ReactNode;
  /** Wrap children in a ScrollView (default: false) */
  scroll?: boolean;
  /** Remove default horizontal padding (default: false) */
  noPadding?: boolean;
  /** Additional style on the inner content container */
  style?: ViewStyle;
}

export function AppScreen({
  children,
  scroll = false,
  noPadding = false,
  style,
}: AppScreenProps) {
  const theme = useTheme();

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: noPadding ? 0 : theme.screenPaddingH,
  };

  const inner = (
    <View style={[contentStyle, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
});
