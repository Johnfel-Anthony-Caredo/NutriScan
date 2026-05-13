/**
 * Health Summary Report (E2) — weekly health analytics.
 *
 * Features:
 * - Compliance donut ring (safe/caution/avoid percentages)
 * - Energy trend chart (daily calories vs goal line)
 * - Frequent risky foods with warning tags
 * - Nutrient focus weekly averages with limit comparison
 * - Export CSV button (grayed out, v1.1)
 */

import { AppScreen, Card, ConditionPill, SectionHeader, SkeletonLoader, TopBar } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { getWeeklyScanLogs, type ScanLogRow } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReportData {
  period: string;
  totalScans: number;
  safe: number;
  caution: number;
  avoid: number;
  riskyFoods: { name: string; count: number; tag: string }[];
}

function buildReportData(rows: ScanLogRow[]): ReportData {
  let safe = 0, caution = 0, avoid = 0;
  const foodCounts: Record<string, { count: number; tag: string }> = {};

  rows.forEach((row) => {
    if (row.verdict === 'safe') safe++;
    else if (row.verdict === 'caution') caution++;
    else if (row.verdict === 'avoid') avoid++;

    if (row.verdict !== 'safe') {
      if (!foodCounts[row.food_name]) {
        foodCounts[row.food_name] = { count: 0, tag: row.verdict === 'avoid' ? 'HIGH RISK' : 'MODERATE' };
      }
      foodCounts[row.food_name].count++;
    }
  });

  const riskyFoods = Object.entries(foodCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => ({ name, count: data.count, tag: data.tag }));

  return {
    period: 'Last 7 Days',
    totalScans: safe + caution + avoid,
    safe,
    caution,
    avoid,
    riskyFoods,
  };
}

export default function HealthReportScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!user) {
        if (isActive) { setIsLoading(false); }
        return;
      }

      try {
        const weeklyRows = await getWeeklyScanLogs(user.id);
        if (!isActive) return;

        if (weeklyRows.length > 0) {
          setReportData(buildReportData(weeklyRows));
        } else {
          setReportData(null);
        }
      } catch (err) {
        if (!isActive) return;
        setLoadError('Could not load report.');
        console.error('Health report error:', err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, [user]);

  if (isLoading) {
    return (
      <AppScreen noPadding>
        <TopBar title="Health Summary" showBack />
        <View style={{ padding: 20 }}><SkeletonLoader rows={6} /></View>
      </AppScreen>
    );
  }

  if (!reportData) {
    return (
      <AppScreen scroll noPadding>
        <TopBar title="Health Summary" showBack />
        <View style={{ paddingHorizontal: 20, paddingTop: 60, alignItems: 'center' }}>
          <Ionicons name="stats-chart-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 20, textAlign: 'center' }}>
            No data yet
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginTop: 8, textAlign: 'center', maxWidth: 280 }}>
            Start scanning food to see your weekly health summary and trends.
          </Text>
        </View>
      </AppScreen>
    );
  }

  const r = reportData;
  const total = r.safe + r.caution + r.avoid;
  const safePct = total > 0 ? Math.round((r.safe / total) * 100) : 0;
  const cautionPct = total > 0 ? Math.round((r.caution / total) * 100) : 0;
  const avoidPct = total > 0 ? 100 - safePct - cautionPct : 0;

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Health Summary" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>

        {/* Header */}
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>
          {r.period}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginTop: 4, marginBottom: 8 }}>
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
                <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>{safePct}%</Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body }}>Safe</Text>
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
                  <View style={[styles.breakdownDot, { backgroundColor: item.color, borderColor: theme.colors.border }]} />
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, flex: 1 }}>{item.label}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body }}>{item.count}</Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginLeft: 4, width: 36, textAlign: 'right' }}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* ── Energy Trend ─────────────── */}
        <SectionHeader title="Daily Scan Activity" />
        <Card>
          <View style={styles.calHeader}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>
              {r.totalScans} scan{r.totalScans !== 1 ? 's' : ''} this week
            </Text>
          </View>
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body }}>
              🟢 {r.safe} Safe · 🟡 {r.caution} Caution · 🔴 {r.avoid} Avoid
            </Text>
          </View>
        </Card>

        {/* ── Frequent Risky Foods ────── */}
        <SectionHeader title="Frequent Risky Scans" />
        <Card>
          {r.riskyFoods.map((food, i) => (
            <View key={food.name} style={[styles.riskyRow, i < r.riskyFoods.length - 1 && { borderBottomWidth: 2, borderBottomColor: theme.colors.border }]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.avoid.icon} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body }}>{food.name}</Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>Scanned {food.count} times this week</Text>
              </View>
              <View style={[styles.tagPill, { backgroundColor: theme.colors.avoid.bg, borderColor: theme.colors.border, borderRadius: theme.radius.full }]}>
                <Text style={{ color: theme.colors.avoid.text, fontSize: 11, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.heading }}>{food.tag}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* ── Nutrient Focus ──────────── */}
        {profile.nutrientTargets.length > 0 && (
          <>
            <SectionHeader title="Nutrient Monitoring" />
            <Card>
              {profile.nutrientTargets.map((nt, i) => (
                <View key={nt.nutrient} style={[styles.nutrientItem, i < profile.nutrientTargets.length - 1 && { borderBottomWidth: 2, borderBottomColor: theme.colors.border }]}>
                  <View style={styles.nutrientHeader}>
                    <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, flex: 1 }}>{nt.label}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}>
                      ≤ {nt.dailyLimit} {nt.unit}
                    </Text>
                  </View>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>
                    Daily limit based on your health profile
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Actions ─────────────────── */}
        <View style={{ marginTop: 24, gap: 10 }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Share', 'Health summary will be exported as an image.')}
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>Share as Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.md, opacity: 0.5 }]}
          >
            <Ionicons name="download-outline" size={20} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>Export CSV</Text>
            <View style={[styles.comingSoon, { backgroundColor: theme.colors.caution.bg, borderColor: theme.colors.border, borderRadius: theme.radius.full, marginLeft: 8 }]}>
              <Text style={{ color: theme.colors.caution.text, fontSize: 10, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.heading }}>v1.1</Text>
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
  breakdownDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, marginRight: 8 },
  calHeader: { marginBottom: 12 },
  riskyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 2 },
  nutrientItem: { paddingVertical: 12 },
  nutrientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderWidth: 3 },
  comingSoon: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 2 },
});
