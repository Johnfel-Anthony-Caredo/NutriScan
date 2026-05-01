/**
 * TopBar — screen header with title, optional back button and right action.
 *
 * Designed for screens that need a custom header outside the
 * default React Navigation header.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface TopBarProps {
  title: string;
  /** Show a back chevron (default: false) */
  showBack?: boolean;
  /** Custom back handler — defaults to router.back() */
  onBack?: () => void;
  /** Render a right-side action element */
  rightAction?: React.ReactNode;
}

export function TopBar({
  title,
  showBack = false,
  onBack,
  rightAction,
}: TopBarProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      {/* Left */}
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.semibold,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right */}
      <View style={[styles.side, styles.rightSide]}>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: {
    width: 44,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
