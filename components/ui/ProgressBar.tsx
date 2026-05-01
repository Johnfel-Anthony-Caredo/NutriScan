/**
 * ProgressBar — step progress indicator for onboarding.
 *
 * Shows which step the user is on with filled/unfilled segments.
 * Reduces anxiety by making progress visible and the flow feel short.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  /** Optional step label like "Step 2 of 4" */
  showLabel?: boolean;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  showLabel = true,
}: ProgressBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.medium,
            marginBottom: 8,
          }}
        >
          Step {currentStep} of {totalSteps}
        </Text>
      )}
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.full }]}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor:
                  i < currentStep ? theme.colors.primary : 'transparent',
                borderRadius: theme.radius.full,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  track: {
    flexDirection: 'row',
    height: 6,
    gap: 4,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: 6,
  },
});
