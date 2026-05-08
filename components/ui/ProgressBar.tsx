import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
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
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.textStyles.label.fontFamily,
              fontWeight: theme.fontWeights.bold,
            },
          ]}
        >
          STEP {currentStep} OF {totalSteps}
        </Text>
      )}
      <View style={[styles.track, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor: i < currentStep ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.border,
                borderRightWidth: i < totalSteps - 1 ? 2 : 0,
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
  label: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  track: {
    flexDirection: 'row',
    height: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: 12,
  },
});
