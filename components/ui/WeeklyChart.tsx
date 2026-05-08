/**
 * WeeklyChart — simple bar chart showing safe/caution/avoid counts per day.
 *
 * Built with pure RN Views — no charting library needed for this
 * simple visualization. Accessible and performant.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { WeeklySummary } from '@/data/mockData';

interface WeeklyChartProps {
  data: WeeklySummary;
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const theme = useTheme();
  const maxPerDay = Math.max(...data.daily.map((d) => d.safe + d.caution + d.avoid), 1);

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {data.daily.map((day) => {
          const total = day.safe + day.caution + day.avoid;
          const h = Math.max((total / maxPerDay) * 80, 4);
          return (
            <View key={day.day} style={styles.barColumn}>
              <View style={styles.barStack}>
                {day.avoid > 0 && (
                  <View style={[styles.segment, { height: (day.avoid / total) * h, backgroundColor: theme.colors.avoid.icon, borderTopLeftRadius: 3, borderTopRightRadius: 3 }]} />
                )}
                {day.caution > 0 && (
                  <View style={[styles.segment, { height: (day.caution / total) * h, backgroundColor: theme.colors.caution.icon }]} />
                )}
                {day.safe > 0 && (
                  <View style={[styles.segment, { height: (day.safe / total) * h, backgroundColor: theme.colors.safe.icon, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }]} />
                )}
                {total === 0 && (
                  <View style={[styles.segment, { height: 4, backgroundColor: theme.colors.surfaceSecondary, borderRadius: 2 }]} />
                )}
              </View>
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 6 }}>
                {day.day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { label: 'Safe', color: theme.colors.safe.icon },
          { label: 'Caution', color: theme.colors.caution.icon },
          { label: 'Avoid', color: theme.colors.avoid.icon },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color, borderColor: theme.colors.border }]} />
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body }}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barColumn: { alignItems: 'center', flex: 1 },
  barStack: { justifyContent: 'flex-end', width: 20 },
  segment: { width: 20 },
  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
});
