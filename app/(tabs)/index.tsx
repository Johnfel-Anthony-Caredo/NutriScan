/**
 * Home Screen — main dashboard tab.
 *
 * Shows greeting, condition pills, today's safety donut summary,
 * scan CTA, today's food log, nutrient watchlist, and health tips carousel.
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, Card, ConditionPill, SectionHeader, PrimaryButton, VerdictBadge, FoodLogItem } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { MOCK_TODAY_LOG, MOCK_TIPS, MOCK_WEEKLY } from '@/data/mockData';

const { width: SCREEN_W } = Dimensions.get('window');

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const hasLogs = MOCK_TODAY_LOG.length > 0;

  return (
    <AppScreen scroll>
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
      <Card style={styles.summaryCard}>
        <View style={styles.donutRow}>
          {/* Simple donut-like ring */}
          <View style={styles.donutContainer}>
            <View style={[styles.donutOuter, { borderColor: theme.colors.safe.icon }]}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold }}>
                {MOCK_WEEKLY.safe + MOCK_WEEKLY.caution + MOCK_WEEKLY.avoid}
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>scans</Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            {[
              { label: 'Safe', count: hasLogs ? MOCK_TODAY_LOG.filter((l) => l.verdict === 'safe').length : 0, color: theme.colors.safe.icon },
              { label: 'Caution', count: hasLogs ? MOCK_TODAY_LOG.filter((l) => l.verdict === 'caution').length : 0, color: theme.colors.caution.icon },
              { label: 'Avoid', count: hasLogs ? MOCK_TODAY_LOG.filter((l) => l.verdict === 'avoid').length : 0, color: theme.colors.avoid.icon },
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

      {/* ── Scan CTA ───────────────────── */}
      <PrimaryButton label="Scan Your Food" onPress={() => router.push('/(tabs)/scan')} icon={<Ionicons name="scan" size={20} color="#FFFFFF" />} style={styles.scanBtn} />

      {/* ── Today's Log ────────────────── */}
      <SectionHeader title="Today's Log" action="See all" onAction={() => router.push('/(tabs)/history')} />
      {hasLogs ? (
        <Card noPadding style={styles.logCard}>
          <View style={{ paddingHorizontal: 16 }}>
            {MOCK_TODAY_LOG.map((item) => (
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsScroll}>
        {MOCK_TIPS.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            onPress={() => router.push(`/article/${tip.id}`)}
            activeOpacity={0.7}
            style={[styles.tipCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: theme.radius.lg, ...theme.shadows.sm }]}
          >
            <View style={[styles.tipIconCircle, { backgroundColor: theme.colors[tip.iconBg].bg }]}>
              <Ionicons name={tip.iconName as keyof typeof Ionicons.glyphMap} size={20} color={theme.colors[tip.iconBg].icon} />
            </View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginTop: 10 }} numberOfLines={2}>{tip.title}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginTop: 4 }} numberOfLines={2}>{tip.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  tipCard: { width: SCREEN_W * 0.6, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  tipIconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
