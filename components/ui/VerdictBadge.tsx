/**
 * VerdictBadge — displays the Safe / Caution / Avoid verdict.
 *
 * Large, clearly colored badge with an icon. The most important
 * visual element on the scan result screen.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { Verdict } from '@/types/health';
import { verdictLabels } from '@/types/health';

interface VerdictBadgeProps {
  verdict: Verdict;
  /** Show a larger version (default: false) */
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
          borderColor: colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Ionicons
        name={verdictIcons[verdict]}
        size={large ? 28 : 20}
        color={colors.icon}
      />
      <Text
        style={[
          styles.label,
          large && styles.largeLabel,
          {
            color: colors.text,
            fontWeight: theme.fontWeights.semibold,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 6,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
  largeLabel: {
    fontSize: 18,
    lineHeight: 24,
  },
});
