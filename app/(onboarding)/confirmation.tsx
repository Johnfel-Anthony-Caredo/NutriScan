/**
 * Confirmation Screen — Step 5: Review and confirm your profile.
 *
 * Shows the full profile summary: conditions, goals, and nutrient targets.
 * Designed to make users feel understood and ready to scan.
 */

import { AppScreen, PrimaryButton, ProfileSummaryCard, SecondaryButton } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ConfirmationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, completeOnboarding } = useProfile();

  const handleStart = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <AppScreen scroll noPadding>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        {/* ── Success Header ──────────────── */}
        <View style={styles.successHeader}>
          <View
            style={[styles.successCircle, { backgroundColor: theme.colors.safe.bg }]}
          >
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.safe.icon} />
          </View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes['2xl'],
              fontWeight: theme.fontWeights.bold,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            You're all set!
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.body,
              lineHeight: theme.lineHeights.body,
              textAlign: 'center',
              marginTop: 6,
              maxWidth: 300,
            }}
          >
            We've personalized NutriScan based on your health profile. Here's what we'll watch for you:
          </Text>
        </View>

        {/* ── Profile Summary ─────────────── */}
        <ProfileSummaryCard profile={profile} />

        {/* ── NutriBot Note ───────────────── */}
        {profile.nutriBotNote ? (
          <View
            style={[
              styles.noteCard,
              {
                backgroundColor: theme.colors.primaryLight,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <View style={styles.noteHeader}>
              <Ionicons name="chatbubble-ellipses" size={16} color={theme.colors.primary} />
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.fontSizes.sm,
                  fontWeight: theme.fontWeights.semibold,
                  marginLeft: 6,
                }}
              >
                Your note to NutriBot
              </Text>
            </View>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.sm,
                lineHeight: theme.lineHeights.sm,
                marginTop: 6,
                fontStyle: 'italic',
              }}
            >
              "{profile.nutriBotNote}"
            </Text>
          </View>
        ) : null}

        {/* ── Actions ─────────────────────── */}
        <View style={styles.actions}>
          <PrimaryButton
            label="Start Scanning"
            onPress={handleStart}
            icon={<Ionicons name="scan" size={20} color="#FFFFFF" />}
          />
          <SecondaryButton
            label="Edit My Profile"
            onPress={() => router.back()}
            style={{ marginTop: 12 }}
          />
        </View>

        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.sm,
            textAlign: 'center',
            marginTop: 16,
            lineHeight: theme.lineHeights.sm,
          }}
        >
          You can update your health profile anytime{'\n'}from the Profile tab.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  successHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteCard: {
    padding: 16,
    marginTop: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    marginTop: 32,
  },
});
