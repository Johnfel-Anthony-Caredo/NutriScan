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
  scroll?: boolean;
  noPadding?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshError?: string | null;
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
      {refreshError ? (
        <View
          style={[
            styles.errorToast,
            {
              backgroundColor: theme.colors.avoid.bg,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.avoid.icon} />
          <Text
            style={[
              styles.errorText,
              {
                color: theme.colors.avoid.text,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.textStyles.body.fontFamily,
              },
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
      <StatusBar style="dark" />
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
                colors={[theme.colors.primary]}
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
    borderWidth: 2,
  },
  errorText: {
    flex: 1,
    lineHeight: 18,
  },
});
