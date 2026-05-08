import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { VerdictBadge } from './VerdictBadge';
import type { FoodItem } from '@/types/health';

interface FoodLogItemProps {
  item: FoodItem;
  onPress?: () => void;
}

const mealIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

export function FoodLogItem({ item, onPress }: FoodLogItemProps) {
  const theme = useTheme();
  const time = new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
      accessibilityRole="button"
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
        <Ionicons
          name={mealIcons[item.mealType ?? 'snack'] ?? 'restaurant-outline'}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.body,
            fontFamily: theme.textStyles.body.fontFamily,
            fontWeight: theme.fontWeights.semibold,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.sm,
            marginTop: 2,
            fontFamily: theme.textStyles.body.fontFamily,
          }}
        >
          {item.mealType ? item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1) : 'Snack'} . {time}
        </Text>
      </View>
      <VerdictBadge verdict={item.verdict} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
});
