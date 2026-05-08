/**
 * AppScreen — the base screen wrapper for every NutriScan screen.
 *
 * Provides:
 * - SafeAreaView with theme background
 * - Optional ScrollView with pull-to-refresh support
 * - Consistent horizontal padding
 * - StatusBar theming
 * - Accessible refresh error toast
 */

import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface AppScreenProps {
  children: React.ReactNode;
  /** Wrap children in a ScrollView (default: false) */
  scroll?: boolean;
  /** Remove default horizontal padding (default: false) */
  noPadding?: boolean;
  /** Additional style on the inner content container */
  style?: ViewStyle;
  /** If set, enables pull-to-refresh on the ScrollView */
  refreshing?: boolean;
  /** Called when user pulls to refresh */
  onRefresh?: () => void;
  /** Optional error banner shown below the refresh area after a failed refresh */
  refreshError?: string | null;
  /** Callback to dismiss the error banner */
  onDismissError?: () => void;
}

export function AppScreen({
  children,
  scroll = false,
  noPadding = false,
  style,
  refreshing,
  onRefresh,
  refreshError,
  onDismissError,
}: AppScreenProps) {
  const theme = useTheme();

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: noPadding ? 0 : theme.screenPaddingH,
  };

  const showRefresh = refreshing !== undefined && onRefresh !== undefined;

  const inner = (
    <View style={[contentStyle, style]}>
      {/* Refresh error toast */}
      {refreshError ? (
        <View
          style={[
            styles.errorToast,
            {
              backgroundColor: theme.colors.avoid.bg,
              borderColor: theme.colors.avoid.border,
              borderRadius: theme.radius.md,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.avoid.icon} />
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm },
            ]}
            numberOfLines={2}
          >
            {refreshError}
          </Text>
          {onDismissError ? (
            <Pressable
              onPress={onDismissError}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
            >
              <Ionicons name="close" size={16} color={theme.colors.avoid.text} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
          refreshControl={
            showRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                progressBackgroundColor={theme.colors.surface}
              />
            ) : undefined
          }
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
  errorToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  errorText: {
    flex: 1,
    lineHeight: 18,
  },
});
