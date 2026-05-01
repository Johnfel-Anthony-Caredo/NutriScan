/**
 * Onboarding Layout — wraps onboarding steps with a progress bar.
 *
 * Tracks the current step via the route segment name and renders
 * a ProgressBar at the top of every onboarding screen.
 */

import { Stack, useSegments } from 'expo-router';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { ProgressBar } from '@/components/ui';
import { lightColors, darkColors } from '@/constants/theme';

const STEP_ORDER = ['welcome', 'conditions', 'goals', 'nutribot-assist', 'confirmation'];
const TOTAL_STEPS = STEP_ORDER.length;

export default function OnboardingLayout() {
  const segments = useSegments();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  // The last segment is the screen name
  const currentScreen = segments[segments.length - 1] ?? 'welcome';
  const stepIndex = STEP_ORDER.indexOf(currentScreen);
  const currentStep = stepIndex >= 0 ? stepIndex + 1 : 1;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Progress bar — visible on all steps except welcome */}
      {currentScreen !== 'welcome' && (
        <View style={styles.progressWrap}>
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  progressWrap: {
    paddingTop: 56,
  },
});
