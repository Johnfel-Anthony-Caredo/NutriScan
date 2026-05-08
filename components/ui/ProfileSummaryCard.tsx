/**
 * ProfileSummaryCard — displays the user's complete health profile summary.
 *
 * Used on the onboarding confirmation screen and on the Profile tab.
 * Shows conditions, goals, and monitored nutrients in a clear layout.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from './Card';
import { ConditionPill } from './ConditionPill';
import type { UserHealthProfile } from '@/types/health';
import { goalLabels, goalIcons, type HealthGoal } from '@/types/health';

interface ProfileSummaryCardProps {
  profile: UserHealthProfile;
  /** Compact mode hides some details */
  compact?: boolean;
}

export function ProfileSummaryCard({ profile, compact = false }: ProfileSummaryCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* ── Conditions ──────────────────── */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart-circle" size={22} color={theme.colors.primary} />
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              fontWeight: theme.fontWeights.semibold,
              fontFamily: theme.fontFamilies.heading,
              marginLeft: 8,
            }}
          >
            Your Conditions
          </Text>
        </View>
        <View style={styles.pillWrap}>
          {profile.conditions.length > 0 ? (
            profile.conditions.map((c) => (
              <ConditionPill key={c} condition={c} />
            ))
          ) : (
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body }}>
              No conditions selected
            </Text>
          )}
        </View>
      </Card>

      {/* ── Goals ───────────────────────── */}
      {!compact && profile.goals.length > 0 && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={22} color={theme.colors.primary} />
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.body,
                fontWeight: theme.fontWeights.semibold,
                fontFamily: theme.fontFamilies.heading,
                marginLeft: 8,
              }}
            >
              Your Goals
            </Text>
          </View>
          {profile.goals.map((g) => (
            <View key={g} style={styles.goalRow}>
              <Text style={styles.goalEmoji}>{goalIcons[g as HealthGoal] ?? '🎯'}</Text>
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.body,
                  fontFamily: theme.fontFamilies.body,
                  marginLeft: 8,
                }}
              >
                {goalLabels[g as HealthGoal] ?? g}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* ── Nutrient Targets ─────────────── */}
      {profile.nutrientTargets.length > 0 && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition" size={22} color={theme.colors.primary} />
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.body,
                fontWeight: theme.fontWeights.semibold,
                fontFamily: theme.fontFamilies.heading,
                marginLeft: 8,
              }}
            >
              Monitored Nutrients
            </Text>
          </View>
          {profile.nutrientTargets.map((nt) => (
            <View key={nt.nutrient} style={styles.nutrientRow}>
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.body,
                  fontFamily: theme.fontFamilies.body,
                  flex: 1,
                }}
              >
                {nt.label}
              </Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.body,
                  fontWeight: theme.fontWeights.medium,
                  fontFamily: theme.fontFamilies.body,
                }}
              >
                {nt.dailyLimit} {nt.unit}/day
              </Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  goalEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#0A0A0A',
  },
});
