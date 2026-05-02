/**
 * Welcome Screen — first step of onboarding.
 *
 * Warm, encouraging intro that explains what's ahead and why
 * personalization matters. Sets the tone for the entire flow.
 */

import { AppScreen, PrimaryButton, SecondaryButton } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { completeOnboarding } = useProfile();

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.top}>
          <View
            style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}
          >
            <Ionicons name="heart" size={52} color={theme.colors.primary} />
          </View>

          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: theme.fontWeights.bold,
              textAlign: 'center',
              marginTop: 28,
            }}
          >
            Let's personalize{'\n'}your experience
          </Text>

          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.lg,
              lineHeight: theme.lineHeights.lg,
              textAlign: 'center',
              marginTop: 12,
              maxWidth: 300,
            }}
          >
            Tell us about your health so we can give you accurate, helpful food guidance.
          </Text>

          <View style={styles.highlights}>
            {[
              { icon: 'shield-checkmark' as const, text: 'Your data stays private' },
              { icon: 'time' as const, text: 'Takes less than 2 minutes' },
              { icon: 'create' as const, text: 'You can change this anytime' },
            ].map((item) => (
              <View key={item.text} style={styles.highlightRow}>
                <View style={[styles.highlightIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
                </View>
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.body,
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Get Started"
            onPress={() => router.push('/(onboarding)/conditions')}
          />
          <SecondaryButton
            label="Skip for Now"
            onPress={() => {
              completeOnboarding();
              router.replace('/(tabs)');
            }}
            style={{ marginTop: 12 }}
          />
          <Text
            style={{
              color: theme.colors.textTertiary,
              fontSize: theme.fontSizes.sm,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: theme.lineHeights.sm,
            }}
          >
            You can always update your health profile{'\n'}from Settings later.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingTop: 60, paddingBottom: 40 },
  top: { alignItems: 'center' },
  iconCircle: { width: 108, height: 108, borderRadius: 54, justifyContent: 'center', alignItems: 'center' },
  highlights: { marginTop: 40, alignSelf: 'stretch', gap: 16, paddingHorizontal: 8 },
  highlightRow: { flexDirection: 'row', alignItems: 'center' },
  highlightIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actions: {},
});
