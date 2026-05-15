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

const LISTED_CONDITIONS: {
  key: HealthCondition;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
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
      router.push('/(onboarding)/nutribot-assist');
      return;
    }

    if (selectedCondition === 'other') {
      if (!customText.trim()) return;
      setPrimaryCondition({
        condition: selectedCondition,
        source: 'other',
        customCondition: customText.trim(),
      });
      router.push('/(onboarding)/goals');
      return;
    }

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
      <View style={styles.content}>
        {/* ── Header ─────────────────────────────── */}
        <Text
          style={[
            theme.textStyles.h2,
            { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
          ]}
        >
          What are you managing?
        </Text>
        <Text
          style={[
            theme.textStyles.body,
            { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
          ]}
        >
          Pick the one that best describes your situation. You can always
          update this later.
        </Text>

        {/* ── Condition cards grid ────────────────── */}
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

        {/* ── Custom condition input ──────────────── */}
        {showCustomInput && (
          <View
            style={[
              styles.customInputWrap,
              {
                backgroundColor: theme.colors.surfaceSecondary,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              placeholder="Describe your condition, e.g. Thyroid disorder, Asthma..."
              placeholderTextColor={theme.colors.textTertiary}
              style={{
                flex: 1,
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.body,
                fontFamily: theme.fontFamilies.body,
                padding: 16,
                minHeight: 60,
              }}
              multiline
              autoFocus
              accessibilityLabel="Describe your condition"
            />
          </View>
        )}

        {/* ── Divider ─────────────────────────────── */}
        <View style={styles.dividerRow}>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.colors.border }]}
          />
          <Text
            style={[
              theme.textStyles.caption,
              { color: theme.colors.textTertiary, marginHorizontal: 12 },
            ]}
          >
            or
          </Text>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.colors.border }]}
          />
        </View>

        {/* ── Bottom options (horizontal) ─────────── */}
        <View style={styles.bottomOptions}>
          <SelectableCard
            key="other"
            label="My condition isn't listed"
            icon="help-circle"
            selected={selectedCondition === 'other'}
            onPress={() => handleSelect('other')}
            style={styles.bottomCard}
            cardStyle={styles.bottomCardInner}
            flat
          />
          <SelectableCard
            key="unsure"
            label="I'm not sure"
            icon="help"
            selected={selectedCondition === 'unsure'}
            onPress={() => handleSelect('unsure')}
            style={styles.bottomCard}
            cardStyle={styles.bottomCardInner}
            flat
          />
        </View>

        {/* ── Validation hint ──────────────────────── */}
        {isOtherSelected && !customText.trim() && (
          <Text
            style={[
              theme.textStyles.small,
              {
                color: theme.colors.textTertiary,
                textAlign: 'center',
                marginTop: theme.spacing.sm,
              },
            ]}
          >
            Please describe your condition to continue.
          </Text>
        )}

        {/* ── CTA ──────────────────────────────────── */}
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
          style={{ marginTop: theme.spacing.xl }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customInputWrap: {
    borderWidth: 3,
    marginTop: 12,
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 3,
  },
  bottomOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomCard: {
    flex: 1,
  },
  bottomCardInner: {
    minHeight: 120,
    justifyContent: 'center',
  },
});
