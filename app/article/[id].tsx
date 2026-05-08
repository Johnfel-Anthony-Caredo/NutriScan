/**
 * Article Detail Screen — full health article with hero image,
 * body content, key takeaways, and related articles.
 *
 * Backed by Wikipedia API via cache-first article service.
 * Editorial typography, generous spacing, premium feel.
 */

import { ArticleHero, TakeawaysCard } from '@/components/articles';
import { AppScreen, SkeletonLoader, TopBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { fetchArticleBySlug, fetchArticlesForConditions } from '@/services/articleService';
import { getCachedArticles } from '@/services/supabaseService';
import type { Article } from '@/types/articles';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORY_LABELS: Record<string, string> = {
  diabetes: 'Diabetes',
  hypertension: 'Hypertension',
  heart_disease: 'Heart Health',
  kidney_disease: 'Kidney Health',
  liver_disease: 'Liver Health',
  cancer: 'Cancer',
  other: 'Nutrition',
};

export default function ArticleDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const slug = Array.isArray(id) ? id[0] : id;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<Article[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!slug) {
        if (isActive) { setError('No article specified'); setIsLoading(false); }
        return;
      }

      try {
        const result = await fetchArticleBySlug(slug);
        if (!isActive) return;

        if (result) {
          setArticle(result);

          // Fetch related articles from the same category (async, non-blocking)
          if (result.category) {
            getCachedArticles(result.category).then((rows) => {
              if (!isActive) return;
              const others = rows
                .map((r): Article => ({
                  slug: r.slug,
                  title: r.title,
                  category: r.category,
                  summary: r.summary,
                  content: r.content,
                  imageUrl: r.image_url,
                  sourceUrl: r.source_url,
                  keyTakeaways: r.key_takeaways ?? [],
                  relatedSlugs: r.related_slugs ?? [],
                }))
                .filter((a) => a.slug !== slug)
                .slice(0, 3);
              setRelated(others);
            }).catch(() => {
              // Silently fail — related articles are non-essential
            });
          }
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        if (!isActive) return;
        setError('Could not load article.');
        console.error('Article load error:', err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, [slug]);

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <AppScreen noPadding>
        <TopBar title="Health Article" showBack />
        <View style={{ padding: 20 }}>
          <View style={{ gap: 16 }}>
            <SkeletonLoader rows={1} />
            <View style={{ height: 200, borderRadius: 12, backgroundColor: theme.colors.surfaceSecondary }} />
            <SkeletonLoader rows={4} />
          </View>
        </View>
      </AppScreen>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error || !article) {
    return (
      <AppScreen noPadding>
        <TopBar title="Health Article" showBack onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="cloud-offline-outline" size={56} color={theme.colors.caution.icon} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 16 }}>
            {error || 'Article not available'}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, lineHeight: theme.lineHeights.body, maxWidth: 280 }}>
            We could not load this article. It may not exist yet or there was a connection issue.
          </Text>
        </View>
      </AppScreen>
    );
  }

  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <AppScreen scroll noPadding>
      {/* ── Top Bar ──────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, flex: 1 }} numberOfLines={1}>
          {article.title}
        </Text>
      </View>

      {/* ── Hero Image ───────────────── */}
      <ArticleHero imageUrl={article.imageUrl} categoryLabel={categoryLabel} height={220} />

      {/* ── Content ──────────────────── */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 48 }}>

        {/* Title */}
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes['2xl'],
            fontWeight: theme.fontWeights.bold,
            fontFamily: theme.fontFamilies.heading,
            lineHeight: theme.lineHeights['2xl'],
            marginTop: 20,
          }}
        >
          {article.title}
        </Text>

        {/* Source credit */}
        <View style={styles.sourceRow}>
          <Ionicons name="globe-outline" size={14} color={theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginLeft: 5 }}>
            Wikipedia &middot; Open access
          </Text>
        </View>

        {/* Summary — editorial lead paragraph */}
        {article.summary ? (
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              fontFamily: theme.fontFamilies.body,
              lineHeight: theme.lineHeights.body,
              marginTop: 20,
            }}
          >
            {article.summary}
          </Text>
        ) : null}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Body content */}
        {article.content && article.content !== article.summary ? (
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              fontFamily: theme.fontFamilies.body,
              lineHeight: theme.lineHeights.body,
              marginBottom: 16,
            }}
          >
            {article.content}
          </Text>
        ) : null}

        {/* ── Key Takeaways ──────────── */}
        <TakeawaysCard takeaways={article.keyTakeaways} />

        {/* ── Read on Wikipedia ──────── */}
        {article.sourceUrl ? (
          <TouchableOpacity
            onPress={() => {} /* Could open in-app browser */}
            style={[styles.sourceBtn, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
            accessibilityRole="button"
          >
            <Ionicons name="globe-outline" size={18} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginLeft: 8, flex: 1 }} numberOfLines={1}>
              Read full article on Wikipedia
            </Text>
            <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : null}

        {/* ── Related Articles ───────── */}
        {related.length > 0 && (
          <View style={{ marginTop: 36 }}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.semibold,
                fontFamily: theme.fontFamilies.heading,
                marginBottom: 14,
              }}
            >
              Related Articles
            </Text>
            {related.map((rel) => (
              <TouchableOpacity
                key={rel.slug}
                onPress={() => router.replace(`/article/${rel.slug}`)}
                activeOpacity={0.7}
                style={[styles.relatedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
                accessibilityRole="button"
              >
                <Text
                  style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}
                  numberOfLines={2}
                >
                  {rel.title}
                </Text>
                {rel.summary ? (
                  <Text
                    style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 4, lineHeight: theme.lineHeights.xs }}
                    numberOfLines={2}
                  >
                    {rel.summary}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, gap: 4 },
  backBtn: { padding: 8 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  divider: { height: 2, marginVertical: 20 },
  sourceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 3, marginTop: 20, paddingHorizontal: 16 },
  relatedCard: { padding: 14, marginBottom: 10, borderWidth: 3 },
});
