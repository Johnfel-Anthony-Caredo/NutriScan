/**
 * ArticleCard — editorial card for the Health Tips carousel.
 *
 * Features:
 * - expo-image with built-in cross-fade and placeholder
 * - Image loading skeleton before reveal
 * - Themed fallback when no image_url
 * - Category chip overlaid on image
 * - Title and summary with safe truncation and padding
 * - Consistent aspect ratio (3:2) for all cards
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { Article } from '@/types/articles';

const IMAGE_ASPECT = 3 / 2; // 3:2 editorial crop — wide enough for context, tall enough for impact

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
  /** Card width — height is derived from IMAGE_ASPECT + content area */
  width: number;
}

export function ArticleCard({ article, onPress, width }: ArticleCardProps) {
  const theme = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const hasImage = !!article.imageUrl && !imageError;
  const imageHeight = width / IMAGE_ASPECT;

  const categoryLabel = (article.category ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Article: ${article.title}`}
      style={[
        styles.card,
        {
          width,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      {/* ── Image Area ─────────────────────── */}
      <View
        style={[
          styles.imageWrap,
          {
            height: imageHeight,
            backgroundColor: theme.colors.surfaceSecondary,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
          },
        ]}
      >
        {hasImage ? (
          <>
            {/* Loading skeleton overlay — fades out when image loads */}
            {imageLoading && (
              <View style={[StyleSheet.absoluteFill, styles.imageShimmer, { backgroundColor: theme.colors.surfaceSecondary }]} />
            )}
            <Image
              source={{ uri: article.imageUrl! }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        ) : (
          /* Fallback — editorial-style illustration area */
          <View style={styles.fallback}>
            <View style={[styles.fallbackIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="newspaper-outline" size={28} color={theme.colors.primary} />
            </View>
          </View>
        )}

        {/* Category chip — overlaid bottom-left */}
        {categoryLabel ? (
          <View
            style={[
              styles.categoryChip,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                borderColor: theme.colors.border,
                borderWidth: 2,
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

      {/* ── Content Area ───────────────────── */}
      <View style={styles.content}>
        {/* Title */}
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.semibold,
            lineHeight: theme.lineHeights.sm,
          }}
          numberOfLines={2}
        >
          {article.title}
        </Text>

        {/* Summary */}
        {article.summary ? (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.xs,
              lineHeight: theme.lineHeights.xs,
              marginTop: 6,
            }}
            numberOfLines={2}
          >
            {article.summary}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 3,
    overflow: 'hidden',
  },
  imageWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  imageShimmer: {
    zIndex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChip: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    maxWidth: '70%',
  },
  categoryText: {
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
});
