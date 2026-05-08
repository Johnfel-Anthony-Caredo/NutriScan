/**
 * Home Screen — main dashboard tab.
 *
 * Shows greeting, condition pills, today's safety donut summary,
 * scan CTA, today's food log, nutrient watchlist, and health tips carousel.
 * Supports pull-to-refresh to reload all data on demand.
 */

import type { Article } from '@/types/articles';
import { ArticleCard } from '@/components/articles';
import { AppScreen, Card, ConditionPill, FoodLogItem, PrimaryButton, SectionHeader, SkeletonLoader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useRefresh } from '@/hooks/useRefresh';
import { useTheme } from '@/hooks/useTheme';
import { fetchArticlesForConditions } from '@/services/articleService';
import { getTodaysScanLogs, getWeeklyScanLogs, type ScanLogRow } from '@/services/supabaseService';
import type { FoodItem } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W * 0.68, 280);

interface WeeklySummaryData {
  safe: number;
  caution: number;
  avoid: number;
  daily: { day: string; safe: number; caution: number; avoid: number }[];
}

const mapScanLogToFoodItem = (row: ScanLogRow): FoodItem => ({
  id: row.id,
  user_id: row.user_id,
  name: row.food_name,
  verdict: row.verdict,
  image_url: row.image_url ?? undefined,
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
    };
  });

  rows.forEach((row) => {
    const scanned = new Date(row.scanned_at);
    scanned.setHours(0, 0, 0, 0);
    const bucket = dayBuckets.find((b) => b.date.getTime() === scanned.getTime());

    if (!bucket) return;

    if (row.verdict === 'safe') bucket.safe += 1;
    if (row.verdict === 'caution') bucket.caution += 1;
    if (row.verdict === 'avoid') bucket.avoid += 1;
  });

  const safe = dayBuckets.reduce((sum, day) => sum + day.safe, 0);
  const caution = dayBuckets.reduce((sum, day) => sum + day.caution, 0);
  const avoid = dayBuckets.reduce((sum, day) => sum + day.avoid, 0);

  return {
    safe,
    caution,
    avoid,
    daily: dayBuckets.map((day) => ({
      day: day.label,
      safe: day.safe,
      caution: day.caution,
      avoid: day.avoid,
    })),
  };
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<FoodItem[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  // ── Data loading (shared between initial load and pull-to-refresh) ──

  const loadScanData = useCallback(async () => {
    if (!user) return;

    const [todayRows, weeklyRows] = await Promise.all([
      getTodaysScanLogs(user.id),
      getWeeklyScanLogs(user.id),
    ]);

    setTodayLog(todayRows.map(mapScanLogToFoodItem));

    if (weeklyRows.length > 0) {
      setWeeklySummary(buildWeeklySummary(weeklyRows));
    } else {
      setWeeklySummary(null);
    }
  }, [user]);

  const loadArticles = useCallback(async () => {
    if (!user) return;
    const fetched = await fetchArticlesForConditions(profile.conditions);
    setArticles(fetched);
  }, [user, profile.conditions]);

  // Combined loader for pull-to-refresh
  const refreshAll = useCallback(async () => {
    await Promise.all([loadScanData(), loadArticles()]);
  }, [loadScanData, loadArticles]);

  const { isRefreshing, refreshError, handleRefresh, dismissError } = useRefresh({
    onRefresh: refreshAll,
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
          await loadScanData();
          if (!isActive) return;
          hasLoadedOnce.current = true;
        } catch (err) {
          if (!isActive) return;
          setLoadError('Could not load your scan data.');
          console.error('Home load error:', err);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      load();

      return () => { isActive = false; };
      // Only re-run when user changes, not on every focus
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]),
  );

  // Articles load separately on mount / when conditions change
  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setArticlesLoading(true);
      try {
        await loadArticles();
      } catch (err) {
        console.warn('Articles fetch failed:', err);
      } finally {
        if (isActive) setArticlesLoading(false);
      }
    };

    if (user) {
      load();
    } else {
      setArticlesLoading(false);
    }

    return () => { isActive = false; };
  }, [user, profile.conditions, loadArticles]);

  const hasLogs = todayLog.length > 0;

  return (
    <AppScreen
      scroll
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      refreshError={refreshError}
      onDismissError={dismissError}
    >
      {/* ── Greeting ───────────────────── */}
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginBottom: 2 }}>Good morning 👋</Text>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold }}>Welcome back</Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="person" size={24} color={theme.colors.primary} />
        </View>
      </View>

      {/* ── Condition Pills ─────────────── */}
      {profile.conditions.length > 0 && (
        <View style={styles.pillRow}>
          {profile.conditions.map((c) => (<ConditionPill key={c} condition={c} />))}
        </View>
      )}

      {/* ── Today's Safety Summary ──────── */}
      <SectionHeader title="Today's Overview" />
      {isLoading ? (
        <Card><SkeletonLoader rows={2} /></Card>
      ) : loadError ? (
        <Card>
          <View style={styles.emptyLog}>
            <Ionicons name="cloud-offline-outline" size={28} color={theme.colors.caution.icon} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center' }}>
              {loadError}
            </Text>
          </View>
        </Card>
      ) : (
      <Card style={styles.summaryCard}>
        <View style={styles.donutRow}>
          {/* Simple donut-like ring */}
          <View style={styles.donutContainer}>
            <View style={[styles.donutOuter, { borderColor: theme.colors.safe.icon }]}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold }}>
                {weeklySummary ? weeklySummary.safe + weeklySummary.caution + weeklySummary.avoid : 0}
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>scans</Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            {[
              { label: 'Safe', count: hasLogs ? todayLog.filter((l) => l.verdict === 'safe').length : 0, color: theme.colors.safe.icon },
              { label: 'Caution', count: hasLogs ? todayLog.filter((l) => l.verdict === 'caution').length : 0, color: theme.colors.caution.icon },
              { label: 'Avoid', count: hasLogs ? todayLog.filter((l) => l.verdict === 'avoid').length : 0, color: theme.colors.avoid.icon },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: s.color }]} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginLeft: 6 }}>{s.count}</Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginLeft: 4 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
      )}

      {/* ── Scan CTA ───────────────────── */}
      <PrimaryButton label="Scan Your Food" onPress={() => router.push('/(tabs)/scan')} icon={<Ionicons name="scan" size={20} color="#FFFFFF" />} style={styles.scanBtn} />

      {/* ── Today's Log ────────────────── */}
      <SectionHeader title="Today's Log" action="See all" onAction={() => router.push('/(tabs)/history')} />
      {hasLogs ? (
        <Card noPadding style={styles.logCard}>
          <View style={{ paddingHorizontal: 16 }}>
            {todayLog.map((item) => (
              <FoodLogItem key={item.id} item={item} onPress={() => router.push('/scan-result')} />
            ))}
          </View>
        </Card>
      ) : (
        <Card>
          <View style={styles.emptyLog}>
            <Ionicons name="restaurant-outline" size={28} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center' }}>
              No meals scanned today.{'\n'}Tap "Scan Your Food" to get started!
            </Text>
          </View>
        </Card>
      )}

      {/* ── Nutrient Watchlist ──────────── */}
      {profile.nutrientTargets.length > 0 && (
        <>
          <SectionHeader title="What We're Watching" />
          <Card style={styles.nutrientCard}>
            {profile.nutrientTargets.slice(0, 4).map((nt) => (
              <View key={nt.nutrient} style={styles.nutrientRow}>
                <View style={[styles.nutrientDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, flex: 1 }}>{nt.label}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>≤ {nt.dailyLimit} {nt.unit}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* ── Health Tips Carousel ────────── */}
      <SectionHeader title="Health Tips" action="Explore" onAction={() => {}} />
      {articlesLoading ? (
        <Card>
          <View style={{ paddingVertical: 4, gap: 10 }}>
            <View style={{ height: 16, borderRadius: 4, backgroundColor: theme.colors.surfaceSecondary, width: '60%' }} />
            <View style={{ height: 100, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceSecondary }} />
          </View>
        </Card>
      ) : articles.length === 0 ? (
        <Card>
          <View style={styles.emptyLog}>
            <Ionicons name="newspaper-outline" size={28} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center' }}>
              {user
                ? 'No health tips available yet. Check back later!'
                : 'Sign in to see personalized health tips.'}
            </Text>
          </View>
        </Card>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsScroll}
          decelerationRate="fast"
          snapToInterval={CARD_W + 12}
          snapToAlignment="start"
        >
          {articles.slice(0, 9).map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              width={CARD_W}
              onPress={() => router.push(`/article/${article.slug}`)}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ height: 100 }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 16 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  summaryCard: { marginBottom: 20 },
  donutRow: { flexDirection: 'row', alignItems: 'center' },
  donutContainer: { marginRight: 20 },
  donutOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, justifyContent: 'center', alignItems: 'center' },
  summaryStats: { flex: 1, gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  scanBtn: { marginBottom: 28 },
  logCard: { marginBottom: 24 },
  emptyLog: { alignItems: 'center', paddingVertical: 20 },
  nutrientCard: { marginBottom: 24 },
  nutrientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  nutrientDot: { width: 8, height: 8, borderRadius: 4 },
  tipsScroll: { paddingRight: 20, gap: 12, paddingBottom: 4 },
});
