import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { Verdict } from '@/types/health';
import { verdictLabels } from '@/types/health';

interface VerdictBadgeProps {
  verdict: Verdict;
  large?: boolean;
}

const verdictIcons: Record<Verdict, keyof typeof Ionicons.glyphMap> = {
  safe: 'checkmark-circle',
  caution: 'warning',
  avoid: 'close-circle',
};

export function VerdictBadge({ verdict, large = false }: VerdictBadgeProps) {
  const theme = useTheme();
  const colors = theme.colors[verdict];

  return (
    <View
      style={[
        styles.badge,
        large && styles.large,
        {
          backgroundColor: colors.bg,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
        },
      ]}
    >
      <Ionicons
        name={verdictIcons[verdict]}
        size={large ? 24 : 18}
        color={colors.icon}
      />
      <Text
        style={[
          styles.label,
          large && styles.largeLabel,
          {
            color: colors.text,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
      >
        {verdictLabels[verdict]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    gap: 6,
  },
  large: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
  },
  largeLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
});
