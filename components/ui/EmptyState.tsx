/**
 * EmptyState — friendly placeholder for screens with no data yet.
 *
 * Shows a centered icon + title + subtitle + optional CTA.
 * Intentionally designed to feel warm, not broken.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'leaf-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.primaryLight },
        ]}
      >
        <Ionicons name={icon} size={40} color={theme.colors.primary} />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.semibold,
          },
        ]}
      >
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.body,
              lineHeight: theme.lineHeights.body,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {/* CTA */}
      {actionLabel && onAction && (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
});
