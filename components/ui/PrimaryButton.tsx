/**
 * PrimaryButton — the main call-to-action button.
 *
 * Medical teal background, white text, generous 52px height
 * for accessible touch targets.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  icon,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? theme.colors.primary + '60'
            : theme.colors.primary,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.textInverse} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.label,
              {
                color: theme.colors.textInverse,
                fontSize: theme.fontSizes.body,
                fontWeight: theme.fontWeights.semibold,
                marginLeft: icon ? 8 : 0,
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 24,
  },
  label: {
    letterSpacing: 0.3,
  },
});
