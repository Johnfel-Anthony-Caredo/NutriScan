import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { HealthCondition } from '@/types/health';
import { conditionLabels } from '@/types/health';

interface ConditionPillProps {
  condition: HealthCondition;
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
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
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
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
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
    borderWidth: 2,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
  },
  compactLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
});
