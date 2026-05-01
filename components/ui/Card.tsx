/**
 * Card — themed surface card with shadow and rounded corners.
 *
 * The primary container for content sections. Uses warm white
 * surface in light mode, elevated dark surface in dark mode.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Remove default padding (default: false) */
  noPadding?: boolean;
}

export function Card({ children, style, noPadding = false }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
        },
        !noPadding && { padding: theme.spacing.lg },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
