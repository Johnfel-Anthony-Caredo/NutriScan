/**
 * Health Summary Report (E2) — weekly health analytics.
 *
 * Features:
 * - Compliance donut ring (safe/caution/avoid percentages)
 * - Energy trend chart (daily calories vs goal line)
 * - Frequent risky foods with warning tags
 * - Nutrient focus weekly averages with limit comparison
 * - Share as Image button (placeholder)
 * - Export CSV button (grayed out, v1.1)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, Card, SectionHeader, ConditionPill } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { MOCK_HEALTH_REPORT } from '@/data/mockData';

export default function HealthReportScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const r = MOCK_HEALTH_REPORT;
  const total = r.safe + r.caution + r.avoid;
  const safePct = Math.round((r.safe / total) * 100);
  const cautionPct = Math.round((r.caution / total) * 100);
  const avoidPct = 100 - safePct - cautionPct;

  const maxCal = Math.max(...r.calories.map((c) => Math.max(c.consumed, c.goal)));

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Health Summary" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>

        {/* Header */}
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold }}>
          {r.period}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 4, marginBottom: 8 }}>
          {r.totalScans} total scans
        </Text>
        {profile.conditions.length > 0 && (
          <View style={styles.pillRow}>
            {profile.conditions.map((c) => (<ConditionPill key={c} condition={c} compact />))}
          </View>
        )}

        {/* ── Compliance Ring ──────────── */}
        <SectionHeader title="Compliance Breakdown" />
        <Card>
          <View style={styles.complianceRow}>
            {/* Ring */}
            <View style={styles.ringWrap}>
              <View style={[styles.ring, { borderColor: theme.colors.safe.icon }]}>
                <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold }}>{safePct}%</Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>Safe</Text>
              </View>
            </View>
            {/* Breakdown */}
            <View style={styles.breakdownCol}>
              {[
                { label: 'Safe', count: r.safe, pct: safePct, color: theme.colors.safe.icon },
                { label: 'Caution', count: r.caution, pct: cautionPct, color: theme.colors.caution.icon },
                { label: 'Avoid', count: r.avoid, pct: avoidPct, color: theme.colors.avoid.icon },
              ].map((item) => (
                <View key={item.label} style={styles.breakdownItem}>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, flex: 1 }}>{item.label}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body }}>{item.count}</Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginLeft: 4, width: 36, textAlign: 'right' }}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* ── Energy Trend ─────────────── */}
        <SectionHeader title="Energy Trend" />
        <Card>
          <View style={styles.calHeader}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>Daily calorie intake vs goal</Text>
          </View>
          <View style={styles.calChart}>
            {r.calories.map((day) => {
              const barH = Math.max((day.consumed / maxCal) * 80, 4);
              const goalH = (day.goal / maxCal) * 80;
              const over = day.consumed > day.goal;
              return (
                <View key={day.day} style={styles.calCol}>
                  <View style={styles.calBarWrap}>
                    {/* Goal line */}
                    <View style={[styles.goalLine, { bottom: goalH, backgroundColor: theme.colors.textTertiary }]} />
                    {/* Bar */}
                    <View style={[styles.calBar, { height: barH, backgroundColor: over ? theme.colors.caution.icon : theme.colors.safe.icon, borderRadius: 3 }]} />
                  </View>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: 10, marginTop: 4 }}>{day.day}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.calLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.safe.icon }]} />
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>Under goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.caution.icon }]} />
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>Over goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.goalLineLegend, { backgroundColor: theme.colors.textTertiary }]} />
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>2,000 kcal goal</Text>
            </View>
          </View>
        </Card>

        {/* ── Frequent Risky Foods ────── */}
        <SectionHeader title="Frequent Risky Foods" />
        <Card>
          {r.riskyFoods.map((food, i) => (
            <View key={food.name} style={[styles.riskyRow, i < r.riskyFoods.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderLight }]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.avoid.icon} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }}>{food.name}</Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 2 }}>Scanned {food.count} times this week</Text>
              </View>
              <View style={[styles.tagPill, { backgroundColor: theme.colors.avoid.bg, borderRadius: theme.radius.full }]}>
                <Text style={{ color: theme.colors.avoid.text, fontSize: 11, fontWeight: theme.fontWeights.semibold }}>{food.tag}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* ── Nutrient Focus ──────────── */}
        <SectionHeader title="Nutrient Focus (Weekly Average)" />
        <Card>
          {r.nutrientAverages.map((n, i) => {
            const ratio = Math.min(n.avgValue / n.limit, 1.5);
            const barW = Math.min(ratio * 100, 100);
            const over = n.overLimit;
            return (
              <View key={n.label} style={[styles.nutrientItem, i < r.nutrientAverages.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderLight }]}>
                <View style={styles.nutrientHeader}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, flex: 1 }}>{n.label}</Text>
                  <Text style={{ color: over ? theme.colors.avoid.text : theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold }}>
                    {n.avgValue} {n.unit}
                  </Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginLeft: 4 }}>/ {n.limit} {n.unit}</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.full }]}>
                  <View style={[styles.barFill, { width: `${barW}%`, backgroundColor: over ? theme.colors.avoid.icon : theme.colors.safe.icon, borderRadius: theme.radius.full }]} />
                </View>
                {over && (
                  <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.xs, marginTop: 4 }}>
                    {Math.round(((n.avgValue - n.limit) / n.limit) * 100)}% over your daily limit
                  </Text>
                )}
              </View>
            );
          })}
        </Card>

        {/* ── Actions ─────────────────── */}
        <View style={{ marginTop: 24, gap: 10 }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Share', 'Health summary will be exported as an image.')}
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginLeft: 8 }}>Share as Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.md, opacity: 0.5 }]}
          >
            <Ionicons name="download-outline" size={20} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginLeft: 8 }}>Export CSV</Text>
            <View style={[styles.comingSoon, { backgroundColor: theme.colors.caution.bg, borderRadius: theme.radius.full, marginLeft: 8 }]}>
              <Text style={{ color: theme.colors.caution.text, fontSize: 10, fontWeight: theme.fontWeights.semibold }}>v1.1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  complianceRow: { flexDirection: 'row', alignItems: 'center' },
  ringWrap: { marginRight: 20 },
  ring: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  breakdownCol: { flex: 1, gap: 8 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center' },
  breakdownDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  calHeader: { marginBottom: 12 },
  calChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  calCol: { alignItems: 'center', flex: 1 },
  calBarWrap: { justifyContent: 'flex-end', width: 20, position: 'relative' },
  calBar: { width: 20 },
  goalLine: { position: 'absolute', left: -4, right: -4, height: 1.5 },
  calLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  goalLineLegend: { width: 12, height: 2 },
  riskyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 4 },
  nutrientItem: { paddingVertical: 12 },
  nutrientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barTrack: { height: 6, overflow: 'hidden' },
  barFill: { height: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  comingSoon: { paddingHorizontal: 8, paddingVertical: 2 },
});
