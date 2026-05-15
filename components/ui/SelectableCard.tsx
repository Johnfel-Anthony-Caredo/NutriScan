import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';

interface SelectableCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  subtitle?: string;
  style?: ViewStyle;
  cardStyle?: ViewStyle;
  flat?: boolean;
}

export function SelectableCard({
  label,
  icon,
  selected,
  onPress,
  subtitle,
  style,
  cardStyle,
  flat = false,
}: SelectableCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      {!flat && Platform.OS === 'android' && (
        <View
          style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.md }]}
          pointerEvents="none"
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={1}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
        style={[
          styles.card,
          {
            backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
          cardStyle,
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={selected ? theme.colors.textInverse : theme.colors.textPrimary}
        />
        <Text
          style={[
            styles.label,
            {
              color: selected ? theme.colors.textInverse : theme.colors.textPrimary,
              fontFamily: theme.textStyles.label.fontFamily,
              fontWeight: theme.fontWeights.bold,
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: selected ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {selected && (
          <View style={styles.check}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.textInverse} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '47%',
  },
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 3,
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 14,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
