/**
 * SelectableCard — large tappable card for multi-select choices.
 *
 * Used in onboarding condition selection and anywhere users
 * need to pick from a list of options with clear visual feedback.
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface SelectableCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  /** Optional subtitle below the label */
  subtitle?: string;
}

export function SelectableCard({
  label,
  icon,
  selected,
  onPress,
  subtitle,
}: SelectableCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.card,
        {
          backgroundColor: selected
            ? theme.colors.primaryLight
            : theme.colors.surface,
          borderColor: selected
            ? theme.colors.primary
            : theme.colors.border,
          borderRadius: theme.radius.md,
          ...theme.shadows.sm,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={28}
        color={selected ? theme.colors.primary : theme.colors.textTertiary}
      />
      <Text
        style={[
          styles.label,
          {
            color: selected ? theme.colors.primary : theme.colors.textPrimary,
            fontSize: theme.fontSizes.sm,
            fontWeight: selected ? theme.fontWeights.semibold : theme.fontWeights.medium,
          },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.xs,
            textAlign: 'center',
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      )}
      {selected && (
        <View style={styles.check}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
