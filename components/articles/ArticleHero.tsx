/**
 * ArticleHero — hero image component for the Article Detail screen.
 *
 * Shows the article's thumbnail as a full-width hero with:
 * - Loading skeleton while image loads
 * - Fallback icon + gradient bg if image is missing or fails
 * - Category chip overlaid bottom-left
 * - Smooth cross-fade transition
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface ArticleHeroProps {
  imageUrl: string | null;
  categoryLabel: string;
  /** Height of the hero area (default: 220) */
  height?: number;
}

export function ArticleHero({ imageUrl, categoryLabel, height = 220 }: ArticleHeroProps) {
  const theme = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const hasImage = !!imageUrl && !imageError;

  return (
    <View
      style={[
        styles.hero,
        {
          height,
          backgroundColor: theme.colors.surfaceSecondary,
        },
      ]}
    >
      {hasImage ? (
        <>
          {/* Loading skeleton */}
          {imageLoading && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.surfaceSecondary }]} />
          )}
          <Image
            source={{ uri: imageUrl! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={350}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </>
      ) : (
        /* Fallback */
        <View style={styles.fallback}>
          <View style={[styles.fallbackIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="newspaper-outline" size={40} color={theme.colors.primary} />
          </View>
        </View>
      )}

      {/* Gradient overlay at bottom for better chip readability */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Category chip */}
      {categoryLabel ? (
        <View
          style={[
            styles.categoryChip,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
            },
          ]}
        >
          <Text
            style={[styles.categoryText, { color: theme.colors.textInverse, fontSize: theme.fontSizes.xs }]}
            numberOfLines={1}
          >
            {categoryLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fallbackIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  categoryChip: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxWidth: '60%',
  },
  categoryText: {
    fontWeight: '600',
  },
});
