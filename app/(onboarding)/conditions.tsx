/**
 * Conditions Screen — Step 2: Select health conditions.
 *
 * Multi-select cards with clear visual feedback.
 * Uses the profile context to persist selections.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, PrimaryButton, SelectableCard } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import type { HealthCondition } from '@/types/health';

const CONDITIONS: { key: HealthCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'diabetes', label: 'Diabetes / Prediabetes', icon: 'water' },
  { key: 'hypertension', label: 'High Blood Pressure', icon: 'pulse' },
  { key: 'heart_disease', label: 'Heart Disease / High Cholesterol', icon: 'heart' },
  { key: 'kidney_disease', label: 'Kidney Disease / Renal Diet', icon: 'fitness' },
  { key: 'liver_disease', label: 'Liver Disease / Hepatitis', icon: 'medkit' },
  { key: 'cancer', label: 'Cancer (on treatment)', icon: 'ribbon' },
  { key: 'other', label: "My condition isn't listed", icon: 'help-circle' },
  { key: 'unsure', label: "I'm not sure", icon: 'help' },
];

export default function ConditionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, setConditions } = useProfile();
  const [selected, setSelected] = useState<Set<HealthCondition>>(
    new Set(profile.conditions),
  );

  const toggle = (key: HealthCondition) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleContinue = () => {
    setConditions(Array.from(selected));
    router.push('/(onboarding)/goals');
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
          What are you managing?
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.body,
            lineHeight: theme.lineHeights.body,
            marginBottom: 24,
          }}
        >
          Select all that apply. We'll personalize your food guidance based on this.
        </Text>

        <View style={styles.grid}>
          {CONDITIONS.map((c) => (
            <SelectableCard
              key={c.key}
              label={c.label}
              icon={c.icon}
              selected={selected.has(c.key)}
              onPress={() => toggle(c.key)}
            />
          ))}
        </View>

        {/* Gentle validation hint */}
        {selected.size === 0 && (
          <Text
            style={{
              color: theme.colors.textTertiary,
              fontSize: theme.fontSizes.sm,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Please select at least one option to continue.
          </Text>
        )}

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={selected.size === 0}
          style={{ marginTop: 24 }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
