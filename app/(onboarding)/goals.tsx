/**
 * Goals Screen — Step 3: Select dietary goals and concerns.
 *
 * Uses SelectableChip components with emoji for friendly visual anchoring.
 * Selections flow into the profile context.
 */

import { AppScreen, PrimaryButton, SelectableChip } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { goalIcons, goalLabels, type HealthGoal } from '@/types/health';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    router.push('/(onboarding)/confirmation');
  };

  return (
    <AppScreen scroll noPadding>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        <Text style={[theme.textStyles.h2, { color: theme.colors.textPrimary, marginBottom: 6 }]}>
          What matters most to you?
        </Text>
        <Text style={[theme.textStyles.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
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
            label="Continue"
            onPress={handleContinue}
          />
        </View>

        <Text style={[theme.textStyles.caption, { color: theme.colors.textTertiary, textAlign: 'center', marginTop: 16 }]}>
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
