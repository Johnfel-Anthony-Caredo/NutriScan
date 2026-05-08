import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
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
      activeOpacity={1}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.textInverse} />
      ) : (
        emoji && <Text style={styles.emoji}>{emoji}</Text>
      )}
      <Text
        style={[
          styles.label,
          {
            color: selected ? theme.colors.textInverse : theme.colors.textPrimary,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
          },
        ]}
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
    borderWidth: 2,
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
  },
});
