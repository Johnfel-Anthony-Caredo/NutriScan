/**
 * Conditions Screen — Step 2: Select your primary health condition.
 *
 * Single-select only. Three paths:
 * 1. Listed condition → saves it, goes to Goals
 * 2. "My condition isn't listed" → reveals text input, saves custom, goes to Goals
 * 3. "I'm not sure" → goes to AI-assisted classification step
 */

import { AppScreen, PrimaryButton, SelectableCard } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import type { HealthCondition } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const LISTED_CONDITIONS: { key: HealthCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'diabetes', label: 'Diabetes / Prediabetes', icon: 'water' },
  { key: 'hypertension', label: 'High Blood Pressure', icon: 'pulse' },
  { key: 'heart_disease', label: 'Heart Disease / High Cholesterol', icon: 'heart' },
  { key: 'kidney_disease', label: 'Kidney Disease / Renal Diet', icon: 'fitness' },
  { key: 'liver_disease', label: 'Liver Disease / Hepatitis', icon: 'medkit' },
  { key: 'cancer', label: 'Cancer (on treatment)', icon: 'ribbon' },
];

export default function ConditionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setPrimaryCondition } = useProfile();
  const [selectedCondition, setSelectedCondition] = useState<HealthCondition | null>(null);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isOtherSelected = selectedCondition === 'other';
  const isUnsureSelected = selectedCondition === 'unsure';
  const isListedSelected = selectedCondition && !isOtherSelected && !isUnsureSelected;

  const handleSelect = (key: HealthCondition) => {
    setSelectedCondition(key);
    if (key === 'other') {
      setShowCustomInput(true);
      setCustomText('');
    } else {
      setShowCustomInput(false);
      setCustomText('');
    }
  };

  const handleContinue = () => {
    if (!selectedCondition) return;

    if (selectedCondition === 'unsure') {
      // Go to AI-assisted classification
      router.push('/(onboarding)/nutribot-assist');
      return;
    }

    if (selectedCondition === 'other') {
      if (!customText.trim()) return; // require text
      setPrimaryCondition({
        condition: selectedCondition,
        source: 'other',
        customCondition: customText.trim(),
      });
      router.push('/(onboarding)/goals');
      return;
    }

    // Listed condition
    setPrimaryCondition({
      condition: selectedCondition,
      source: 'listed',
    });
    router.push('/(onboarding)/goals');
  };

  const canContinue = (() => {
    if (!selectedCondition) return false;
    if (selectedCondition === 'unsure') return true;
    if (selectedCondition === 'other') return customText.trim().length > 0;
    return true;
  })();

  return (
    <AppScreen scroll noPadding>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.md, paddingBottom: 40 }}>
        <Text
          style={[theme.textStyles.h2, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}
        >
          What are you managing?
        </Text>
        <Text
          style={[theme.textStyles.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }]}
        >
          Pick the one that best describes your situation. You can always update this later.
        </Text>

        <View style={styles.grid}>
          {LISTED_CONDITIONS.map((c) => (
            <SelectableCard
              key={c.key}
              label={c.label}
              icon={c.icon}
              selected={selectedCondition === c.key}
              onPress={() => handleSelect(c.key)}
            />
          ))}
        </View>

        {/* Custom condition text input — shown when "other" is selected */}
        {showCustomInput && (
          <View style={[styles.customInputWrap, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              placeholder="Describe your condition, e.g. Thyroid disorder, Asthma..."
              placeholderTextColor={theme.colors.textTertiary}
              style={{ flex: 1, color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, padding: 16, minHeight: 60 }}
              multiline
              autoFocus
              accessibilityLabel="Describe your condition"
            />
          </View>
        )}

        {/* Divider for bottom options */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[theme.textStyles.caption, { color: theme.colors.textTertiary, marginHorizontal: 12 }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* "My condition isn't listed" and "I'm not sure" */}
        <View style={styles.bottomOptions}>
          <SelectableCard
            key="other"
            label="My condition isn't listed"
            icon="help-circle"
            selected={selectedCondition === 'other'}
            onPress={() => handleSelect('other')}
          />
          <View style={{ marginTop: theme.spacing.sm }}>
            <SelectableCard
              key="unsure"
              label="I'm not sure"
              icon="help"
              selected={selectedCondition === 'unsure'}
              onPress={() => handleSelect('unsure')}
            />
          </View>
        </View>

        {isOtherSelected && !customText.trim() && (
          <Text
            style={[theme.textStyles.small, { color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.spacing.sm }]}
          >
            Please describe your condition to continue.
          </Text>
        )}

        <PrimaryButton
          label={
            selectedCondition === 'unsure'
              ? "Let's figure it out"
              : isOtherSelected
                ? 'Continue with my condition'
                : selectedCondition
                  ? 'Continue'
                  : 'Select an option to continue'
          }
          onPress={handleContinue}
          disabled={!canContinue}
          style={{ marginTop: theme.spacing.lg }}
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 3,
  },
  bottomOptions: {
    gap: theme.spacing.xs,
  },
  customInputWrap: {
    borderWidth: 3,
    marginTop: 12,
    marginBottom: 4,
  },
});
