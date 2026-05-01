/**
 * SecondaryButton — outline variant of PrimaryButton.
 *
 * Same accessible 52px height, but with a border instead
 * of a filled background.
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

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function SecondaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  icon,
}: SecondaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        {
          borderColor: isDisabled
            ? theme.colors.border
            : theme.colors.primary,
          borderRadius: theme.radius.md,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.label,
              {
                color: theme.colors.primary,
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
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  label: {
    letterSpacing: 0.3,
  },
});
