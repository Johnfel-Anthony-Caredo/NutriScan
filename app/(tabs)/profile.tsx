/**
 * Profile Screen — user identity, conditions, goals, stats, nutrients, and settings.
 *
 * Fully driven by live profile data. Provides edit actions that re-enter
 * the onboarding flow. Links to NutriBot.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, Card, ConditionPill, SectionHeader, SecondaryButton } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { goalLabels, goalIcons, type HealthGoal } from '@/types/health';

function MenuRow({ icon, label, subtitle, onPress, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuRow, { borderBottomColor: theme.colors.borderLight }]} accessibilityRole="button">
      <View style={[styles.menuIcon, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <Ionicons name={icon} size={18} color={color ?? theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }}>{label}</Text>
        {subtitle && <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, resetProfile } = useProfile();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
              await resetProfile();
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
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
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <AppScreen scroll>
      {/* ── Profile Header ─────────────── */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="person" size={36} color={theme.colors.primary} />
        </View>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, marginTop: 12 }}>
          NutriScan User
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 2 }}>
          {profile.conditions.length > 0
            ? `Managing ${profile.conditions.length} condition${profile.conditions.length > 1 ? 's' : ''}`
            : 'Health-conscious eater'}
        </Text>
      </View>

      {/* ── Conditions ─────────────────── */}
      <SectionHeader title="My Conditions" action="Edit" onAction={handleEditProfile} />
      {profile.conditions.length > 0 ? (
        <View style={styles.pillRow}>
          {profile.conditions.map((c) => (<ConditionPill key={c} condition={c} />))}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.body, textAlign: 'center' }}>No conditions set yet</Text>
          <SecondaryButton label="Set Up Profile" onPress={handleEditProfile} style={{ marginTop: 12 }} />
        </Card>
      )}

      {/* ── Goals ──────────────────────── */}
      {profile.goals.length > 0 && (
        <>
          <SectionHeader title="My Goals" action="Edit" onAction={() => router.push('/(onboarding)/goals')} />
          <Card>
            {profile.goals.map((g) => (
              <View key={g} style={styles.goalRow}>
                <Text style={styles.goalEmoji}>{goalIcons[g as HealthGoal] ?? '\u{1F3AF}'}</Text>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, marginLeft: 8 }}>
                  {goalLabels[g as HealthGoal] ?? g}
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* ── Quick Stats ────────────────── */}
      <SectionHeader title="My Stats" />
      <View style={styles.statsGrid}>
        {[
          { icon: 'scan' as const, label: 'Total Scans', value: '19' },
          { icon: 'checkmark-circle' as const, label: 'Safe This Week', value: '12' },
          { icon: 'flame' as const, label: 'Day Streak', value: '5' },
        ].map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={24} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, marginTop: 8 }}>{stat.value}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginTop: 2 }}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      {/* ── Nutrient Monitoring ─────────── */}
      {profile.nutrientTargets.length > 0 && (
        <>
          <SectionHeader title="Nutrient Monitoring" action="Edit" onAction={handleEditProfile} />
          <Card>
            {profile.nutrientTargets.map((nt) => (
              <View key={nt.nutrient} style={styles.nutrientRow}>
                <View style={[styles.nutrientDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, flex: 1 }}>{nt.label}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium }}>
                  {'\u2264'} {nt.dailyLimit} {nt.unit}/day
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* ── Quick Actions ──────────────── */}
      <SectionHeader title="Quick Actions" />
      <Card noPadding>
        <MenuRow icon="chatbubble-ellipses-outline" label="Chat with NutriBot" subtitle="Ask about food, diet, or scans" onPress={() => router.push('/nutribot')} />
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
      <View style={{ marginTop: 24, gap: 12 }}>
        <TouchableOpacity
          onPress={handleResetProfile}
          style={[styles.actionBtn, { borderColor: theme.colors.caution.border, borderRadius: theme.radius.md }]}
          accessibilityRole="button"
        >
          <Ionicons name="refresh-outline" size={20} color={theme.colors.caution.icon} />
          <Text style={{ color: theme.colors.caution.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginLeft: 8 }}>
            Reset Profile & Restart Onboarding
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={[styles.actionBtn, { borderColor: theme.colors.avoid.border, borderRadius: theme.radius.md, opacity: isLoggingOut ? 0.6 : 1 }]}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.avoid.icon} />
          <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginLeft: 8 }}>
            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Medical Disclaimer ─────────── */}
      <Card style={styles.disclaimer}>
        <View style={styles.disclaimerRow}>
          <Ionicons name="medical-outline" size={16} color={theme.colors.caution.icon} />
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, marginLeft: 6, flex: 1, lineHeight: theme.lineHeights.xs }}>
            NutriScan provides general guidance, not medical advice. Always consult your healthcare provider.
          </Text>
        </View>
      </Card>

      <View style={{ height: 100 }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 24, marginBottom: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  emptyCard: { marginBottom: 28, alignItems: 'center', paddingVertical: 20 },
  goalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  goalEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center' },
  nutrientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  nutrientDot: { width: 8, height: 8, borderRadius: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderWidth: 1.5 },
  disclaimer: { marginTop: 16, opacity: 0.8 },
  disclaimerRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
