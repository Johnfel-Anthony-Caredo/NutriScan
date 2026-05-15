/**
 * Home Screen — main dashboard tab.
 *
 * Shows greeting, condition pills, today's safety donut summary,
 * scan CTA, recent scans list with food images, nutrient watchlist,
 * and health tips carousel. Supports pull-to-refresh.
 */

import type { Article } from '@/types/articles';
import { ArticleCard } from '@/components/articles';
import {
  AppScreen,
  Card,
  ConditionPill,
  FoodLogItem,
  NutritionDashboard,
  PrimaryButton,
  SectionHeader,
  SkeletonLoader,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useRefresh } from '@/hooks/useRefresh';
import { useTheme } from '@/hooks/useTheme';
import { fetchArticlesForConditions } from '@/services/articleService';
import { getResolvedImageUrl } from '@/services/storageService';
import {
  getRecentScanLogs,
  getTodaysScanLogs,
  getWeeklyScanLogs,
  type ScanLogRow,
} from '@/services/supabaseService';
import type { FoodItem } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W * 0.68, 280);

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

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<FoodItem[]>([]);
  const [recentLog, setRecentLog] = useState<FoodItem[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  // ── Data loading ──────────────────────────────────────────────

  const loadScanData = useCallback(async () => {
    if (!user) return;

    const [todayRows, weeklyRows, recentRows] = await Promise.all([
      getTodaysScanLogs(user.id),
      getWeeklyScanLogs(user.id),
      getRecentScanLogs(user.id, 5),
    ]);

    setTodayLog(todayRows.map(mapScanLogToFoodItem));
    setRecentLog(recentRows.map(mapScanLogToFoodItem));

    if (weeklyRows.length > 0) {
      setWeeklySummary(buildWeeklySummary(weeklyRows));
    } else {
      setWeeklySummary(null);
    }
  }, [user]);

  const loadArticles = useCallback(async () => {
    if (!user) return;
    const fetched = await fetchArticlesForConditions(profile.conditions);
    setArticles(fetched.filter((a) => !!a.imageUrl));
  }, [user, profile.conditions]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadScanData(), loadArticles()]);
  }, [loadScanData, loadArticles]);

  const { isRefreshing, refreshError, handleRefresh, dismissError } = useRefresh({
    onRefresh: refreshAll,
  });

  // ── Initial load on screen focus ──────────────────────────────

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]),
  );

  // ── Articles load ─────────────────────────────────────────────

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

  const hasRecentLogs = recentLog.length > 0;
  const hasTodayLogs = todayLog.length > 0;

  // ── Render ────────────────────────────────────────────────────

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
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginBottom: 2 }}>Good morning 👋</Text>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>Welcome back</Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
          <Image source={require('../../assets/images/avatar.png')} style={styles.avatarImage} />
        </View>
      </View>

      {/* ── Condition Pills ─────────────── */}
      {profile.conditions.length > 0 && (
        <View style={styles.pillRow}>
          {profile.conditions.map((c) => (<ConditionPill key={c} condition={c} />))}
        </View>
      )}

      {/* ── Nutrition Dashboard ──────────── */}
      {isLoading ? (
        <Card><SkeletonLoader rows={3} /></Card>
      ) : loadError ? (
        <Card>
          <View style={styles.emptyLog}>
            <Ionicons name="cloud-offline-outline" size={28} color={theme.colors.caution.icon} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center', fontFamily: theme.fontFamilies.body }}>
              {loadError}
            </Text>
          </View>
        </Card>
      ) : (
        <NutritionDashboard
          todayScans={todayLog.filter((l) => l.verdict !== 'invalid').length}
          nutrientTargets={profile.nutrientTargets}
        />
      )}

      {/* ── Scan CTA ───────────────────── */}
      <PrimaryButton label="Scan Your Food" onPress={() => router.push('/(tabs)/scan')} icon={<Ionicons name="scan" size={20} color="#FFFFFF" />} style={styles.scanBtn} />

      {/* ── Today's Overview ────────────── */}
      <SectionHeader title="Today's Overview" style={{ marginTop: 0 }} />
      {!isLoading && !loadError && (
        <Card style={styles.summaryCard}>
          <View style={styles.donutRow}>
            <View style={styles.donutContainer}>
              <View style={[styles.donutOuter, { borderColor: theme.colors.safe.icon }]}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>
                  {weeklySummary ? weeklySummary.safe + weeklySummary.caution + weeklySummary.avoid + weeklySummary.invalid : 0}
                </Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body }}>scans</Text>
              </View>
            </View>
            <View style={styles.summaryStats}>
              {[
                { label: 'Safe', count: hasTodayLogs ? todayLog.filter((l) => l.verdict === 'safe').length : 0, color: theme.colors.safe.icon },
                { label: 'Caution', count: hasTodayLogs ? todayLog.filter((l) => l.verdict === 'caution').length : 0, color: theme.colors.caution.icon },
                { label: 'Avoid', count: hasTodayLogs ? todayLog.filter((l) => l.verdict === 'avoid').length : 0, color: theme.colors.avoid.icon },
                { label: 'Invalid', count: hasTodayLogs ? todayLog.filter((l) => l.verdict === 'invalid').length : 0, color: theme.colors.invalid.icon },
              ].map((s) => (
                <View key={s.label} style={styles.statItem}>
                  <View style={[styles.statDot, { backgroundColor: s.color, borderColor: theme.colors.border }]} />
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 6 }}>{s.count}</Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginLeft: 4 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* ── Recent Scans ────────────────── */}
      <SectionHeader title="Recent Scans" action="See all" onAction={() => router.push('/(tabs)/history')} />
      {hasRecentLogs ? (
        <Card noPadding flat style={styles.logCard}>
          <View style={{ paddingHorizontal: 16 }}>
            {recentLog.map((item) => (
              <FoodLogItem key={item.id} item={item} showImage onPress={() => router.push({ pathname: '/scan-result', params: { scanLogId: item.id } })} />
            ))}
          </View>
        </Card>
      ) : (
        <Card>
          <View style={styles.emptyLog}>
            <Ionicons name="restaurant-outline" size={28} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center', fontFamily: theme.fontFamilies.body }}>
              No meals scanned yet.{'\n'}Tap "Scan Your Food" to get started!
            </Text>
          </View>
        </Card>
      )}

      {/* ── Nutrient Watchlist ──────────── */}
      {profile.nutrientTargets.length > 0 && (
        <>
          <SectionHeader title="What We're Watching" />
          <Card style={styles.nutrientCard}>
            {profile.nutrientTargets.slice(0, 4).map((nt, i) => (
              <View key={`${nt.nutrient}-${i}`} style={styles.nutrientRow}>
                <View style={[styles.nutrientDot, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, flex: 1 }}>{nt.label}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>≤ {nt.dailyLimit} {nt.unit}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* ── Health Tips Carousel ────────── */}
      <SectionHeader title="Health Tips" />
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
  avatarCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  summaryCard: { marginBottom: 20 },
  donutRow: { flexDirection: 'row', alignItems: 'center' },
  donutContainer: { marginRight: 20 },
  donutOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, justifyContent: 'center', alignItems: 'center' },
  summaryStats: { flex: 1, gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  scanBtn: { marginBottom: 28 },
  logCard: { marginBottom: 24 },
  emptyLog: { alignItems: 'center', paddingVertical: 20 },
  nutrientCard: { marginBottom: 24 },
  nutrientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  nutrientDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  tipsScroll: { paddingRight: 20, gap: 12, paddingBottom: 4 },
});
