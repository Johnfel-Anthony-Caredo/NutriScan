/**
 * SelectableChip — pill-shaped tag for multi-select choices.
 *
 * Used for goal selection, dietary concerns, and filter tags.
 * Includes emoji support for friendly visual anchoring.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Optional emoji shown before label */
  emoji?: string;
}

export function SelectableChip({
  label,
  selected,
  onPress,
  emoji,
}: SelectableChipProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primaryLight
            : theme.colors.surface,
          borderColor: selected
            ? theme.colors.primary
            : theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text
        style={{
          color: selected ? theme.colors.primary : theme.colors.textPrimary,
          fontSize: theme.fontSizes.body,
          fontWeight: selected ? theme.fontWeights.semibold : theme.fontWeights.regular,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
});
