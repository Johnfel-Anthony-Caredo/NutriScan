/**
 * Profile Screen — user identity, conditions, goals, stats, nutrients, and settings.
 *
 * Fully driven by live profile data. Provides edit actions that re-enter
 * the onboarding flow. Links to NutriBot.
 */

import { AppScreen, Card, ConditionPill, SecondaryButton, SectionHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { goalIcons, goalLabels, type HealthGoal } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import { getAllUserScans, updateUserProfile, upsertNutrientTargets, upsertUserConditions } from '@/services/supabaseService';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function MenuRow({ icon, label, subtitle, onPress, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[styles.menuRow, { borderBottomColor: theme.colors.border }]} accessibilityRole="button">
      <View style={[styles.menuIcon, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
        <Ionicons name={icon} size={18} color={color ?? theme.colors.primary} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, fontWeight: subtitle ? theme.fontWeights.semibold : theme.fontWeights.medium }}>{label}</Text>
        {subtitle && <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={subtitle ? theme.colors.primary : theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, resetProfile } = useProfile();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({ total: 0, safePercent: 0, streak: 0 });
  const avatarUri = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (!user) return;

      const loadStats = async () => {
        try {
          const scans = await getAllUserScans(user.id);
          if (!isActive) return;

          const total = scans.length;
          let safePercent = 0;
          let streak = 0;

          if (total > 0) {
            const safeCount = scans.filter(s => s.verdict === 'safe').length;
            safePercent = Math.round((safeCount / total) * 100);

            let currentStreak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            const scanDates = new Set(scans.map(s => {
              const d = new Date(s.scanned_at);
              d.setHours(0, 0, 0, 0);
              return d.getTime();
            }));

            let checkDate = new Date(currentDate);
            if (!scanDates.has(checkDate.getTime())) {
              checkDate.setDate(checkDate.getDate() - 1);
            }

            while (scanDates.has(checkDate.getTime())) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
            streak = currentStreak;
          }

          setStats({ total, safePercent, streak });
        } catch (error) {
          console.error('Failed to load stats:', error);
        }
      };

      loadStats();

      return () => {
        isActive = false;
      };
    }, [user])
  );

  const handleEditProfile = () => router.push('/(onboarding)/conditions');

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of NutriScan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile',
      'This will clear your health profile and restart onboarding. You will remain logged in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProfile();
            // Also clear remote Supabase data so the old profile isn't restored on re-hydration
            if (user) {
              try {
                await Promise.all([
                  updateUserProfile(user.id, { onboarding_completed: false, goals: [], nutribot_note: '' }),
                  upsertUserConditions(user.id, []),
                  upsertNutrientTargets(user.id, []),
                ]);
              } catch (error) {
                console.warn('Remote profile reset failed:', error);
              }
            }
            router.replace('/(onboarding)/welcome');
          },
        },
      ],
    );
  };

  return (
    <AppScreen scroll>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 3, borderRadius: theme.radius.md }]}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarRing, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSecondary }]}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <Image source={require('../../assets/images/avatar.png')} style={styles.avatarImage} />}
            </View>
            {user ? <View style={[styles.activeBadge, { backgroundColor: '#E0F2F1', borderColor: theme.colors.border }]}><View style={styles.activeDot} /><Text style={styles.activeText}>Active</Text></View> : null}
          </View>
        </View>

        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 16, textAlign: 'center' }}>
          {profile.name || 'NutriScan User'}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginTop: 4, textAlign: 'center' }}>
          {user?.email ?? 'Health-conscious eater'}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 10, textAlign: 'center', lineHeight: theme.lineHeights.sm }}>
          {profile.conditions.length > 0 ? `Managing ${profile.conditions.length} condition${profile.conditions.length > 1 ? 's' : ''}` : 'Personalized nutrition profile'}
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/edit-profile')}
          style={[styles.editProfileBtn, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border, borderRadius: theme.radius.full }]}
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginLeft: 6 }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Conditions ─────────────────── */}
      <SectionHeader title="My Conditions" action="Edit" onAction={handleEditProfile} style={{ marginTop: 0 }} />
      {profile.conditions.length > 0 ? (
        <Card style={styles.emptyCard}><View style={styles.pillRow}>{profile.conditions.map((c) => (<ConditionPill key={c} condition={c} />))}</View></Card>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, textAlign: 'center' }}>No conditions set yet</Text>
          <SecondaryButton label="Set Up Profile" onPress={handleEditProfile} style={{ marginTop: 12 }} />
        </Card>
      )}

      {profile.goals.length > 0 && (
        <>
          <SectionHeader title="My Goals" action="Edit" onAction={() => router.push('/(onboarding)/goals')} />
          <Card><View style={styles.goalWrap}>{profile.goals.map((g) => (<View key={g} style={[styles.goalChip, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.full }]}><Text style={styles.goalEmoji}>{goalIcons[g as HealthGoal] ?? '🎯'}</Text><Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body }}>{goalLabels[g as HealthGoal] ?? g}</Text></View>))}</View></Card>
        </>
      )}

      {/* ── Quick Stats ────────────────── */}
      <SectionHeader title="My Stats" />
      <View style={styles.statsGrid}>{[{ icon: 'scan' as const, label: 'Total Scans', value: stats.total.toString() }, { icon: 'checkmark-circle' as const, label: 'Safe Scans', value: stats.total > 0 ? `${stats.safePercent}%` : '—' }, { icon: 'flame' as const, label: 'Day Streak', value: stats.streak.toString() }].map((stat) => (<Card key={stat.label} style={styles.statCard}><View style={[styles.statIconWrap, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}><Ionicons name={stat.icon} size={20} color={theme.colors.primary} /></View><Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginTop: 12, textAlign: 'center' }}>{stat.label}</Text><Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 4, textAlign: 'center' }}>{stat.value}</Text></Card>))}</View>

      {/* ── Nutrient Monitoring ─────────── */}
      {profile.nutrientTargets.length > 0 && (
        <>
          <SectionHeader title="Nutrient Monitoring" action="Edit" onAction={handleEditProfile} />
          <Card>{profile.nutrientTargets.map((nt, index) => (<View key={`${nt.nutrient}-${index}`} style={[styles.nutrientRow, index < profile.nutrientTargets.length - 1 && { borderBottomWidth: 2, borderBottomColor: theme.colors.border }]}><View style={[styles.nutrientDot, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]} /><View style={styles.nutrientCopy}><View style={styles.nutrientTopRow}><Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, flex: 1 }}>{nt.label}</Text><Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body }}>{'≤'} {nt.dailyLimit} {nt.unit}/day</Text></View><View style={[styles.nutrientTrack, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}><View style={[styles.nutrientFill, { backgroundColor: theme.colors.primary }]} /></View></View></View>))}</Card>
        </>
      )}

      {/* ── Quick Actions ──────────────── */}
      <SectionHeader title="Quick Actions" />
      <Card noPadding>
        <MenuRow icon="chatbubble-ellipses-outline" label="Chat with NutriBot" subtitle="Ask about food, diet, or scans" onPress={() => router.push('/(tabs)/nutribot')} />
        <MenuRow icon="time-outline" label="Chat History" subtitle="View past conversations" onPress={() => router.push('/chat-history')} />
        <MenuRow icon="stats-chart-outline" label="Health Report" subtitle="Weekly summary and trends" onPress={() => router.push('/health-report')} />
      </Card>

      {/* ── Privacy ─────────────────────── */}
      <SectionHeader title="Privacy" />
      <Card noPadding>
        <MenuRow icon="lock-closed-outline" label="Data Privacy" subtitle="Your data stays on your device" onPress={() => {}} />
        <MenuRow icon="trash-outline" label="Clear Scan History" onPress={() => Alert.alert('Clear History', 'This will remove all scanned food history.', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive' }])} />
      </Card>

      {/* ── Support ─────────────────────── */}
      <SectionHeader title="Support" />
      <Card noPadding>
        <MenuRow icon="help-circle-outline" label="Help Center" onPress={() => {}} />
        <MenuRow icon="chatbox-outline" label="Send Feedback" onPress={() => {}} />
        <MenuRow icon="star-outline" label="Rate NutriScan" onPress={() => {}} />
      </Card>

      {/* ── About ───────────────────────── */}
      <SectionHeader title="About" />
      <Card noPadding>
        <MenuRow icon="information-circle-outline" label="App Version" subtitle="1.0.0 (MVP)" onPress={() => {}} />
        <MenuRow icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
        <MenuRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
      </Card>

      {/* ── Account Actions ────────────── */}
      <View style={styles.actionGroup}>
        {/* Restart — amber */}
        <View>
          {Platform.OS === 'android' && (
            <View style={[styles.actionShadow, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.full }]} pointerEvents="none" />
          )}
          <TouchableOpacity
            onPress={handleResetProfile}
            style={[styles.actionBtn, { backgroundColor: '#D4872F', borderColor: theme.colors.border, borderRadius: theme.radius.full }]}
            activeOpacity={1}
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Restart Onboarding</Text>
          </TouchableOpacity>
        </View>

        {/* Logout — red */}
        <View>
          {Platform.OS === 'android' && (
            <View style={[styles.actionShadow, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.full }]} pointerEvents="none" />
          )}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            style={[styles.actionBtn, { backgroundColor: isLoggingOut ? '#C0392B' + '60' : '#C0392B', borderColor: isLoggingOut ? theme.colors.textTertiary : theme.colors.border, borderRadius: theme.radius.full, opacity: isLoggingOut ? 0.6 : 1 }]}
            activeOpacity={1}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionLabel}>{isLoggingOut ? 'Logging Out...' : 'Log Out'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22, marginBottom: 28 },
  avatarWrap: { position: 'relative' },
  avatarRing: { width: 108, height: 108, borderRadius: 54, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatar: { width: 92, height: 92, borderRadius: 46, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  activeBadge: { position: 'absolute', right: -8, bottom: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 2 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16a34a', marginRight: 5 },
  activeText: { color: '#16a34a', fontSize: 11, fontWeight: '600' as const, fontFamily: 'DM Sans' as const, letterSpacing: 0.3 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 3 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emptyCard: { marginBottom: 28, alignItems: 'center', paddingVertical: 20 },
  goalWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 3 },
  goalEmoji: { fontSize: 18, marginRight: 8 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18, minHeight: 130 },
  statIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  nutrientRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 10 },
  nutrientDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, borderWidth: 2 },
  nutrientCopy: { flex: 1 },
  nutrientTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nutrientTrack: { height: 6, borderRadius: 999, marginTop: 10, overflow: 'hidden', borderWidth: 2 },
  nutrientFill: { width: '100%', height: '100%', opacity: 0.22 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, minHeight: 72, borderBottomWidth: 2 },
  menuCopy: { flex: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2 },
  actionGroup: { marginTop: 24, gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    paddingHorizontal: 28,
    borderWidth: 3,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  actionShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
});
