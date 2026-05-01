/**
 * Profile Screen — user identity, conditions, goals, stats, and settings.
 *
 * Now driven by live profile data from ProfileContext.
 * Users can re-enter onboarding to edit their profile.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import {
  AppScreen,
  Card,
  ConditionPill,
  SectionHeader,
  SecondaryButton,
  ProfileSummaryCard,
} from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useProfile();

  const handleEditProfile = () => {
    router.push('/(onboarding)/conditions');
  };

  return (
    <AppScreen scroll>
      {/* ── Profile Header ─────────────── */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="person" size={36} color={theme.colors.primary} />
        </View>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes['2xl'],
            fontWeight: theme.fontWeights.bold,
            marginTop: 12,
          }}
        >
          NutriScan User
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.body,
            marginTop: 2,
          }}
        >
          {profile.conditions.length > 0
            ? `Managing ${profile.conditions.length} condition${profile.conditions.length > 1 ? 's' : ''}`
            : 'Health-conscious eater'}
        </Text>
      </View>

      {/* ── Conditions ─────────────────── */}
      <SectionHeader title="My Conditions" action="Edit" onAction={handleEditProfile} />
      {profile.conditions.length > 0 ? (
        <View style={styles.pillRow}>
          {profile.conditions.map((c) => (
            <ConditionPill key={c} condition={c} />
          ))}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.body, textAlign: 'center' }}>
            No conditions set yet
          </Text>
          <SecondaryButton
            label="Set Up Profile"
            onPress={handleEditProfile}
            style={{ marginTop: 12 }}
          />
        </Card>
      )}

      {/* ── Quick Stats ────────────────── */}
      <SectionHeader title="My Stats" />
      <View style={styles.statsGrid}>
        {[
          { icon: 'scan' as const, label: 'Total Scans', value: '0' },
          { icon: 'checkmark-circle' as const, label: 'Safe This Week', value: '0' },
          { icon: 'flame' as const, label: 'Day Streak', value: '0' },
        ].map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={24} color={theme.colors.primary} />
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.xl,
                fontWeight: theme.fontWeights.bold,
                marginTop: 8,
              }}
            >
              {stat.value}
            </Text>
            <Text
              style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginTop: 2 }}
            >
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>

      {/* ── Health Profile Summary ──────── */}
      {profile.nutrientTargets.length > 0 && (
        <>
          <SectionHeader title="Nutrient Monitoring" action="Edit" onAction={handleEditProfile} />
          <Card style={styles.nutrientSection}>
            {profile.nutrientTargets.map((nt) => (
              <View key={nt.nutrient} style={styles.nutrientRow}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, flex: 1 }}>
                  {nt.label}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium }}>
                  ≤ {nt.dailyLimit} {nt.unit}/day
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* ── NutriBot Section ───────────── */}
      <SectionHeader title="NutriBot" />
      <Card>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push('/nutribot')}
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
          <Text
            style={{
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              fontWeight: theme.fontWeights.medium,
              marginLeft: 12,
            }}
          >
            Chat with NutriBot
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </Card>

      {/* ── Settings ───────────────────── */}
      <SecondaryButton
        label="Settings"
        onPress={() => {}}
        icon={<Ionicons name="settings-outline" size={18} color={theme.colors.primary} />}
        style={styles.settingsButton}
      />

      <View style={{ height: 100 }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 24, marginBottom: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  emptyCard: { marginBottom: 28, alignItems: 'center', paddingVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center' },
  nutrientSection: { marginBottom: 24 },
  nutrientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  settingsButton: { marginTop: 20 },
});
