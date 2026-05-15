/**
 * FoodLogItem — a scan log row with optional food image thumbnail.
 *
 * When `showImage` is true, renders a 64x64 image on the left.
 * Falls back to a meal-type icon circle if no image is available.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { VerdictBadge } from './VerdictBadge';
import type { FoodItem } from '@/types/health';

interface FoodLogItemProps {
  item: FoodItem;
  onPress?: () => void;
  showImage?: boolean;
}

const mealIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

export function FoodLogItem({ item, onPress, showImage = false }: FoodLogItemProps) {
  const theme = useTheme();
  const time = new Date(item.scannedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const imageUrl = item.image_url || item.imageUri;
  const hasImage = showImage && !!imageUrl;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
      accessibilityRole="button"
    >
      {/* Thumbnail */}
      {showImage && (
        <View
          style={[
            styles.thumbWrap,
            {
              backgroundColor: theme.colors.surfaceSecondary,
            },
          ]}
        >
          {hasImage ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbImg}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <Ionicons
              name={mealIcons[item.mealType ?? 'snack'] ?? 'restaurant-outline'}
              size={26}
              color={theme.colors.primary}
            />
          )}
        </View>
      )}

      {/* Text content */}
      <View style={styles.content}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.body,
            fontFamily: theme.textStyles.body.fontFamily,
            fontWeight: theme.fontWeights.semibold,
          }}
          numberOfLines={1}
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
          {time}
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
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
});
