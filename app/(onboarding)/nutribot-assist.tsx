/**
 * NutriBot Assist Screen — Step 4 (Optional).
 *
 * Users can describe their health situation in plain text.
 * This is optional and non-blocking — users can skip ahead.
 * The note is saved to the profile for future NutriBot context.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, PrimaryButton, SecondaryButton, Card } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';

const EXAMPLES = [
  '"My doctor told me to reduce potassium and limit fluids."',
  '"I'm pre-diabetic and trying to lose 10 kg."',
  '"I have high cholesterol and want to eat more fiber."',
];

export default function NutriBotAssistScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, setNutriBotNote } = useProfile();
  const [note, setNote] = useState(profile.nutriBotNote ?? '');

  const handleContinue = () => {
    if (note.trim()) {
      setNutriBotNote(note.trim());
    }
    router.push('/(onboarding)/confirmation');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/confirmation');
  };

  return (
    <AppScreen scroll noPadding>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        {/* ── Header ─────────────────────── */}
        <View style={styles.headerRow}>
          <View
            style={[styles.botAvatar, { backgroundColor: theme.colors.primaryLight }]}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.xl,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              Anything else we should know?
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.body,
            lineHeight: theme.lineHeights.body,
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          Tell NutriBot about your situation in your own words. This is completely optional — skip ahead anytime.
        </Text>

        {/* ── Text Input ─────────────────── */}
        <TextInput
          multiline
          numberOfLines={5}
          value={note}
          onChangeText={setNote}
          placeholder="Describe your health situation, dietary restrictions, or anything your doctor mentioned..."
          placeholderTextColor={theme.colors.textTertiary}
          textAlignVertical="top"
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: note.trim()
                ? theme.colors.primary
                : theme.colors.border,
              borderRadius: theme.radius.md,
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              lineHeight: theme.lineHeights.body,
            },
          ]}
          accessibilityLabel="Describe your health situation"
        />

        {/* Character count */}
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.xs,
            textAlign: 'right',
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          {note.length} / 500
        </Text>

        {/* ── Examples ───────────────────── */}
        <Card>
          <View style={styles.exampleHeader}>
            <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.sm,
                fontWeight: theme.fontWeights.medium,
                marginLeft: 6,
              }}
            >
              Not sure what to write? Here are some examples:
            </Text>
          </View>
          {EXAMPLES.map((ex, i) => (
            <Text
              key={i}
              style={{
                color: theme.colors.textTertiary,
                fontSize: theme.fontSizes.sm,
                lineHeight: theme.lineHeights.sm,
                marginTop: 8,
                fontStyle: 'italic',
              }}
            >
              {ex}
            </Text>
          ))}
        </Card>

        {/* ── Actions ────────────────────── */}
        <View style={styles.actions}>
          <PrimaryButton
            label={note.trim() ? 'Continue' : 'Continue without note'}
            onPress={handleContinue}
          />
          {!note.trim() && (
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
            fontSize: theme.fontSizes.xs,
            textAlign: 'center',
            marginTop: 16,
            lineHeight: theme.lineHeights.xs,
          }}
        >
          NutriBot uses this to give you better guidance.{'\n'}This is stored on your device only.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1.5,
    padding: 16,
    minHeight: 130,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    marginTop: 28,
  },
});
