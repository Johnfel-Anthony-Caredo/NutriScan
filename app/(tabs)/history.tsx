/**
 * History Screen — food log, weekly chart, and daily summary.
 *
 * Shows weekly trend chart, daily summary card, today's food log,
 * and frequent risky foods section.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, Card, SectionHeader, VerdictBadge, FoodLogItem, WeeklyChart, EmptyState } from '@/components/ui';
import { MOCK_TODAY_LOG, MOCK_WEEKLY } from '@/data/mockData';

const DAYS = ['Today', 'Yesterday', 'Mon', 'Tue', 'Wed'];

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0);
  const hasLogs = MOCK_TODAY_LOG.length > 0;

  const total = MOCK_WEEKLY.safe + MOCK_WEEKLY.caution + MOCK_WEEKLY.avoid;

  return (
    <AppScreen scroll>
      {/* ── Header ─────────────────────── */}
      <View style={styles.header}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold }}>
          History
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 4 }}>
          Track your food choices over time
        </Text>
      </View>

      {/* ── Weekly Summary Card ────────── */}
      <SectionHeader title="This Week" />
      <Card style={styles.weekCard}>
        <View style={styles.weekStats}>
          <View style={styles.weekStatItem}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['3xl'], fontWeight: theme.fontWeights.bold }}>{total}</Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>Total Scans</Text>
          </View>
          <View style={styles.weekStatDivider} />
          {[
            { label: 'Safe', count: MOCK_WEEKLY.safe, verdict: 'safe' as const },
            { label: 'Caution', count: MOCK_WEEKLY.caution, verdict: 'caution' as const },
            { label: 'Avoid', count: MOCK_WEEKLY.avoid, verdict: 'avoid' as const },
          ].map((s) => (
            <View key={s.verdict} style={styles.weekStatSmall}>
              <Text style={{ color: theme.colors[s.verdict].text, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold }}>{s.count}</Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
        <WeeklyChart data={MOCK_WEEKLY} />
      </Card>

      {/* ── Day Selector ───────────────── */}
      <SectionHeader title="Daily Log" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
        {DAYS.map((day, i) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(i)}
            style={[styles.dayChip, {
              backgroundColor: selectedDay === i ? theme.colors.primary : theme.colors.surface,
              borderColor: selectedDay === i ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.full,
            }]}
            accessibilityRole="button"
          >
            <Text style={{
              color: selectedDay === i ? theme.colors.textInverse : theme.colors.textPrimary,
              fontSize: theme.fontSizes.sm,
              fontWeight: selectedDay === i ? theme.fontWeights.semibold : theme.fontWeights.regular,
            }}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Daily Summary ──────────────── */}
      {selectedDay === 0 && hasLogs && (
        <Card style={styles.dailySummary}>
          <View style={styles.dailySummaryRow}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.safe.icon} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, marginLeft: 8 }}>
              {MOCK_TODAY_LOG.filter((l) => l.verdict === 'safe').length} safe, {MOCK_TODAY_LOG.filter((l) => l.verdict === 'caution').length} caution, {MOCK_TODAY_LOG.filter((l) => l.verdict === 'avoid').length} avoid
            </Text>
          </View>
        </Card>
      )}

      {/* ── Food Log List ──────────────── */}
      {selectedDay === 0 && hasLogs ? (
        <Card noPadding>
          <View style={{ paddingHorizontal: 16 }}>
            {MOCK_TODAY_LOG.map((item) => (
              <FoodLogItem key={item.id} item={item} onPress={() => router.push('/scan-result')} />
            ))}
          </View>
        </Card>
      ) : (
        <EmptyState
          icon="receipt-outline"
          title={selectedDay === 0 ? 'No scans yet today' : 'No scans on this day'}
          subtitle="Scan your meals to build a complete picture of your daily nutrition."
          actionLabel={selectedDay === 0 ? 'Scan Now' : undefined}
          onAction={selectedDay === 0 ? () => router.push('/(tabs)/scan') : undefined}
        />
      )}

      {/* ── Frequent Risky Foods ────────── */}
      <SectionHeader title="Foods to Watch" />
      <Card>
        {[
          { name: 'Instant Ramen', count: 3, verdict: 'avoid' as const },
          { name: 'White Bread', count: 5, verdict: 'caution' as const },
        ].map((food) => (
          <View key={food.name} style={[styles.riskyRow, { borderBottomColor: theme.colors.borderLight }]}>
            <Ionicons name="alert-circle" size={18} color={theme.colors[food.verdict].icon} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }}>{food.name}</Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>Scanned {food.count} times this week</Text>
            </View>
            <VerdictBadge verdict={food.verdict} />
          </View>
        ))}
      </Card>

      <View style={{ height: 100 }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, marginBottom: 24 },
  weekCard: { marginBottom: 24 },
  weekStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  weekStatItem: { alignItems: 'center' },
  weekStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.08)', marginHorizontal: 16 },
  weekStatSmall: { alignItems: 'center', flex: 1 },
  dayScroll: { gap: 8, paddingBottom: 16 },
  dayChip: { paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1 },
  dailySummary: { marginBottom: 12 },
  dailySummaryRow: { flexDirection: 'row', alignItems: 'center' },
  riskyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
