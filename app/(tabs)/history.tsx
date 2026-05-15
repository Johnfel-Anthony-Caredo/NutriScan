/**
 * History Screen — food log, weekly chart, and daily summary.
 *
 * Shows weekly trend chart, daily summary card, today's food log,
 * and frequent risky foods section. Supports pull-to-refresh.
 */

import { AppScreen, Card, EmptyState, FoodLogItem, SectionHeader, SkeletonLoader, VerdictBadge, WeeklyChart } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useRefresh } from '@/hooks/useRefresh';
import { useTheme } from '@/hooks/useTheme';
import { getResolvedImageUrl } from '@/services/storageService';
import { getAllUserScans, getTodaysScanLogs, getWeeklyScanLogs, type ScanLogRow } from '@/services/supabaseService';
import type { FoodItem } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeeklySummaryData {
  safe: number;
  caution: number;
  avoid: number;
  invalid: number;
  daily: { day: string; safe: number; caution: number; avoid: number; invalid: number }[];
}

const mapScanLogToFoodItem = (row: ScanLogRow): FoodItem => ({
  id: row.id,
  user_id: row.user_id,
  name: row.food_name,
  verdict: row.verdict,
  image_url: getResolvedImageUrl(row.image_url),
  scannedAt: row.scanned_at,
  mealType: row.meal_type ?? undefined,
});

const buildWeeklySummary = (rows: ScanLogRow[]): WeeklySummaryData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayBuckets = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));

    return {
      date,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      safe: 0,
      caution: 0,
      avoid: 0,
      invalid: 0,
    };
  });

  rows.forEach((row) => {
    const scanned = new Date(row.scanned_at);
    scanned.setHours(0, 0, 0, 0);
    const bucket = dayBuckets.find((b) => b.date.getTime() === scanned.getTime());

    if (!bucket) return;

    if (row.verdict === 'safe') bucket.safe += 1;
    else if (row.verdict === 'caution') bucket.caution += 1;
    else if (row.verdict === 'avoid') bucket.avoid += 1;
    else if (row.verdict === 'invalid') bucket.invalid += 1;
  });

  const safe = dayBuckets.reduce((sum, day) => sum + day.safe, 0);
  const caution = dayBuckets.reduce((sum, day) => sum + day.caution, 0);
  const avoid = dayBuckets.reduce((sum, day) => sum + day.avoid, 0);
  const invalid = dayBuckets.reduce((sum, day) => sum + day.invalid, 0);

  return {
    safe,
    caution,
    avoid,
    invalid,
    daily: dayBuckets.map((day) => ({
      day: day.label,
      safe: day.safe,
      caution: day.caution,
      avoid: day.avoid,
      invalid: day.invalid,
    })),
  };
};

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0);
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<FoodItem[]>([]);
  const [allLog, setAllLog] = useState<FoodItem[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Data loading function (shared between focus load and pull-to-refresh) ──

  const loadHistoryData = useCallback(async () => {
    if (!user) return;

    const [todayRows, weeklyRows, allRows] = await Promise.all([
      getTodaysScanLogs(user.id),
      getWeeklyScanLogs(user.id),
      getAllUserScans(user.id),
    ]);

    setTodayLog(todayRows.map(mapScanLogToFoodItem));
    setAllLog(allRows.map(mapScanLogToFoodItem));

    if (weeklyRows.length > 0) {
      setWeeklySummary(buildWeeklySummary(weeklyRows));
    } else {
      setWeeklySummary(null);
    }
  }, [user]);

  const { isRefreshing, refreshError, handleRefresh, dismissError } = useRefresh({
    onRefresh: loadHistoryData,
  });

  // ── Initial load on screen focus ──

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        setIsLoading(true);
        setLoadError(null);

        if (!user) {
          if (isActive) setIsLoading(false);
          return;
        }

        try {
          await loadHistoryData();
        } catch (err) {
          if (!isActive) return;
          setLoadError('Could not load history data.');
          console.error('History load error:', err);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      load();

      return () => { isActive = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]),
  );

  const hasLogs = todayLog.length > 0;
  const hasAllLogs = allLog.length > 0;
  const total = weeklySummary ? weeklySummary.safe + weeklySummary.caution + weeklySummary.avoid + weeklySummary.invalid : 0;

  const dayChips = ['Today', 'Yesterday', ...(weeklySummary?.daily.slice(0, 5).map(d => d.day) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']), 'All'];

  // Compute date boundaries for each day chip (excluding "All")
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dayDates: number[] = [
    todayStart.getTime(),                                // Today
    todayStart.getTime() - 86400000,                     // Yesterday
    todayStart.getTime() - 6 * 86400000,                 // 6 days ago
    todayStart.getTime() - 5 * 86400000,                 // 5 days ago
    todayStart.getTime() - 4 * 86400000,                 // 4 days ago
    todayStart.getTime() - 3 * 86400000,                 // 3 days ago
    todayStart.getTime() - 2 * 86400000,                 // 2 days ago
  ];

  const isAll = selectedDay === dayChips.length - 1;
  const displayLog = isAll
    ? allLog
    : allLog.filter((item) => {
        const itemDate = new Date(item.scannedAt);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === dayDates[selectedDay];
      });
  const hasDisplayLogs = displayLog.length > 0;
  // Summary counts for the selected day
  const daySafe = displayLog.filter((l) => l.verdict === 'safe').length;
  const dayCaution = displayLog.filter((l) => l.verdict === 'caution').length;
  const dayAvoid = displayLog.filter((l) => l.verdict === 'avoid').length;
  const dayInvalid = displayLog.filter((l) => l.verdict === 'invalid').length;

  return (
    <AppScreen
      scroll
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      refreshError={refreshError}
      onDismissError={dismissError}
    >
      {/* ── Header ─────────────────────── */}
      <View style={styles.header}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>
          History
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>
          Track your food choices over time
        </Text>
      </View>

      {/* ── Weekly Summary Card ────────── */}
      <SectionHeader title="This Week" style={{ marginTop: 0 }} />
      {isLoading ? (
        <Card><SkeletonLoader rows={3} /></Card>
      ) : loadError ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="cloud-offline-outline" size={28} color={theme.colors.caution.icon} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center' }}>{loadError}</Text>
          </View>
        </Card>
      ) : !weeklySummary ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={28} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center' }}>
              No scans this week yet.{'\n'}Start scanning to see your weekly trends.
            </Text>
          </View>
        </Card>
      ) : (
      <Card style={styles.weekCard}>
        <View style={styles.weekStats}>
          <View style={styles.weekStatItem}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['3xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>{total}</Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>Total Scans</Text>
          </View>
          <View style={[styles.weekStatDivider, { backgroundColor: theme.colors.border }]} />
          {[
            { label: 'Safe', count: weeklySummary.safe, verdict: 'safe' as const },
            { label: 'Caution', count: weeklySummary.caution, verdict: 'caution' as const },
            { label: 'Avoid', count: weeklySummary.avoid, verdict: 'avoid' as const },
            { label: 'Invalid', count: weeklySummary.invalid, verdict: 'invalid' as const },
          ].map((s) => (
            <View key={s.verdict} style={styles.weekStatSmall}>
              <Text style={{ color: theme.colors[s.verdict].text, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>{s.count}</Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
        {weeklySummary.daily.length > 0 && <WeeklyChart data={weeklySummary} />}
      </Card>
      )}

      {/* ── Day Selector ───────────────── */}
      <SectionHeader title="Daily Log" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
        {dayChips.map((day, i) => (
          <TouchableOpacity
            key={`${day}-${i}`}
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
              fontFamily: theme.fontFamilies.body,
              fontWeight: selectedDay === i ? theme.fontWeights.semibold : theme.fontWeights.regular,
            }}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Daily Summary ──────────────── */}
      {!isAll && hasDisplayLogs && (
        <Card flat style={styles.dailySummary}>
          <View style={styles.dailySummaryRow}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.safe.icon} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>
              {daySafe} safe, {dayCaution} caution, {dayAvoid} avoid{dayInvalid > 0 ? `, ${dayInvalid} invalid` : ''}
            </Text>
          </View>
        </Card>
      )}

      {/* ── Food Log List ──────────────── */}
      {hasDisplayLogs ? (
        <Card noPadding flat>
          <View style={{ paddingHorizontal: 16 }}>
            {displayLog.map((item) => (
              <FoodLogItem key={item.id} item={item} showImage onPress={() => router.push({ pathname: '/scan-result', params: { scanLogId: item.id } })} />
            ))}
          </View>
        </Card>
      ) : (
        <EmptyState
          icon="receipt-outline"
          title={isAll ? 'No scans yet' : selectedDay === 0 ? 'No scans yet today' : 'No scans on this day'}
          subtitle="Scan your meals to build a complete picture of your daily nutrition."
          actionLabel={selectedDay === 0 && !isAll ? 'Scan Now' : undefined}
          onAction={selectedDay === 0 && !isAll ? () => router.push('/(tabs)/scan') : undefined}
        />
      )}

      {/* ── Frequent Risky Foods ────────── */}
      {hasLogs && (
        <>
          <SectionHeader title="Foods to Watch" />
          <Card noPadding flat>
            {todayLog.filter((l) => l.verdict === 'avoid' || l.verdict === 'caution').slice(0, 3).map((food) => (
              <TouchableOpacity
                key={food.id}
                onPress={() => router.push({ pathname: '/scan-result', params: { scanLogId: food.id } })}
                style={[styles.riskyRow, { borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
              >
                {/* Small thumbnail */}
                <View style={[styles.riskyThumb, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  {food.image_url ? (
                    <Image source={{ uri: food.image_url }} style={styles.riskyThumbImg} contentFit="cover" />
                  ) : (
                    <Ionicons name="alert-circle" size={18} color={theme.colors[food.verdict].icon} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body }} numberOfLines={1}>{food.name}</Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>
                    {new Date(food.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <VerdictBadge verdict={food.verdict} />
              </TouchableOpacity>
            ))}
            {todayLog.filter((l) => l.verdict === 'avoid' || l.verdict === 'caution').length === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, textAlign: 'center' }}>
                  No risky foods today — great choices!
                </Text>
              </View>
            )}
          </Card>
        </>
      )}

      {/* ── View Full Report ───────────── */}
      <TouchableOpacity
        onPress={() => router.push('/health-report')}
        style={[styles.reportBtn, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
        accessibilityRole="button"
      >
        <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>
          View Full Report
        </Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, marginBottom: 24 },
  weekCard: { marginBottom: 24 },
  weekStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  weekStatItem: { alignItems: 'center' },
  weekStatDivider: { width: 2, height: 36, marginHorizontal: 16 },
  weekStatSmall: { alignItems: 'center', flex: 1 },
  dayScroll: { gap: 8, paddingBottom: 16 },
  dayChip: { paddingHorizontal: 18, paddingVertical: 10, borderWidth: 3 },
  dailySummary: { marginBottom: 12 },
  dailySummaryRow: { flexDirection: 'row', alignItems: 'center' },
  riskyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, paddingHorizontal: 16, gap: 6 },
  riskyThumb: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  riskyThumbImg: { width: '100%', height: '100%' },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, marginTop: 20, borderWidth: 3 },
});
