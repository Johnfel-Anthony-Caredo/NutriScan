/**
 * ConditionPill — small rounded chip for displaying a health condition.
 *
 * Used in the Home header, Profile, and NutriBot context bar
 * so users always see which conditions are active.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { HealthCondition } from '@/types/health';
import { conditionLabels } from '@/types/health';

interface ConditionPillProps {
  condition: HealthCondition;
  /** Smaller variant for tight spaces (default: false) */
  compact?: boolean;
}

export function ConditionPill({ condition, compact = false }: ConditionPillProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.pill,
        compact && styles.compact,
        {
          backgroundColor: theme.colors.primaryLight,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          compact && styles.compactLabel,
          {
            color: theme.colors.primary,
            fontWeight: theme.fontWeights.medium,
          },
        ]}
        numberOfLines={1}
      >
        {conditionLabels[condition]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
  compactLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
