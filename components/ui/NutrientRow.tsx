/**
 * NutrientRow — displays a single nutrient with value, limit, and warning.
 *
 * Highlights over-limit nutrients in red. Shows condition-specific
 * warning text below the row when applicable.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { NutrientInfo } from '@/data/mockData';

interface NutrientRowProps {
  nutrient: NutrientInfo;
}

export function NutrientRow({ nutrient }: NutrientRowProps) {
  const theme = useTheme();
  const ratio = nutrient.dailyLimit > 0 ? nutrient.value / nutrient.dailyLimit : 0;
  const barWidth = Math.min(ratio * 100, 100);

  const barColor = nutrient.overLimit
    ? theme.colors.avoid.icon
    : ratio > 0.7
      ? theme.colors.caution.icon
      : theme.colors.safe.icon;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, flex: 1 }}>
          {nutrient.label}
        </Text>
        <Text style={{ color: nutrient.overLimit ? theme.colors.avoid.text : theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold }}>
          {nutrient.value} {nutrient.unit}
        </Text>
        <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginLeft: 4 }}>
          / {nutrient.dailyLimit} {nutrient.unit}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.full }]}>
        <View style={[styles.bar, { width: `${barWidth}%`, backgroundColor: barColor, borderRadius: theme.radius.full }]} />
      </View>

      {/* Warning text */}
      {nutrient.warning && (
        <View style={styles.warningRow}>
          <Ionicons name="alert-circle" size={14} color={nutrient.overLimit ? theme.colors.avoid.icon : theme.colors.caution.icon} />
          <Text style={{ color: nutrient.overLimit ? theme.colors.avoid.text : theme.colors.caution.text, fontSize: theme.fontSizes.sm, marginLeft: 4, flex: 1 }}>
            {nutrient.warning}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  track: { height: 10, overflow: 'hidden', borderWidth: 2 },
  bar: { height: 6, marginTop: 2, marginLeft: 2 },
  warningRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});
