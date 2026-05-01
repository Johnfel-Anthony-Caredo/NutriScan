/**
 * Goals Screen — Step 3: Select dietary goals and concerns.
 *
 * Uses SelectableChip components with emoji for friendly visual anchoring.
 * Selections flow into the profile context.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, PrimaryButton, SecondaryButton, SelectableChip } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { goalLabels, goalIcons, type HealthGoal } from '@/types/health';

const ALL_GOALS: HealthGoal[] = [
  'lower_sugar',
  'reduce_sodium',
  'manage_weight',
  'cut_fat',
  'protect_kidneys',
  'avoid_processed',
  'protect_heart',
  'doctor_other',
];

export default function GoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, setGoals } = useProfile();
  const [selected, setSelected] = useState<Set<HealthGoal>>(
    new Set(profile.goals),
  );

  const toggle = (key: HealthGoal) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleContinue = () => {
    setGoals(Array.from(selected));
    router.push('/(onboarding)/nutribot-assist');
  };

  const handleSkip = () => {
    setGoals([]);
    router.push('/(onboarding)/nutribot-assist');
  };

  return (
    <AppScreen scroll noPadding>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.bold,
            marginBottom: 6,
          }}
        >
          What matters most to you?
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.body,
            lineHeight: theme.lineHeights.body,
            marginBottom: 24,
          }}
        >
          Pick the goals that feel important right now. You can always change these later.
        </Text>

        <View style={styles.chipWrap}>
          {ALL_GOALS.map((g) => (
            <SelectableChip
              key={g}
              label={goalLabels[g]}
              emoji={goalIcons[g]}
              selected={selected.has(g)}
              onPress={() => toggle(g)}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={selected.size > 0 ? `Continue with ${selected.size} goal${selected.size > 1 ? 's' : ''}` : 'Continue'}
            onPress={handleContinue}
          />
          {selected.size === 0 && (
            <SecondaryButton
              label="Skip this step"
              onPress={handleSkip}
              style={{ marginTop: 12 }}
            />
          )}
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
          Don't worry — we won't judge your choices.{'\n'}These goals help us focus on what matters to you.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  actions: {},
});
