/**
 * Article Detail (C3) — full health tip article.
 *
 * Features:
 * - Full-width hero image placeholder
 * - Category pill + read time + date
 * - Source credit (Wikipedia)
 * - Full article body paragraphs
 * - Key Takeaways box (teal tinted)
 * - Related Tips section (horizontal scroll)
 * - Bookmark toggle + Share button
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, Card } from '@/components/ui';
import { MOCK_ARTICLES, MOCK_TIPS } from '@/data/mockData';

export default function ArticleDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bookmarked, setBookmarked] = useState(false);

  const article = MOCK_ARTICLES[id ?? '1'];
  if (!article) {
    return (
      <AppScreen>
        <Text style={{ color: theme.colors.textPrimary, textAlign: 'center', marginTop: 100 }}>Article not found</Text>
      </AppScreen>
    );
  }

  const relatedArticles = article.relatedIds
    .map((rid) => MOCK_ARTICLES[rid])
    .filter(Boolean);

  return (
    <AppScreen scroll noPadding>
      {/* ── Top Bar ──────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, flex: 1 }} numberOfLines={1}>
          {article.title}
        </Text>
        <TouchableOpacity onPress={() => setBookmarked(!bookmarked)} accessibilityRole="button" style={styles.iconBtn}>
          <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={bookmarked ? theme.colors.primary : theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Hero Image ───────────────── */}
      <View style={[styles.hero, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name="newspaper-outline" size={56} color={theme.colors.primary} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        {/* ── Meta Row ───────────────── */}
        <View style={styles.metaRow}>
          <View style={[styles.catPill, { backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.full }]}>
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold }}>{article.category}</Text>
          </View>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>{article.readTime}</Text>
          <View style={[styles.metaDot, { backgroundColor: theme.colors.textTertiary }]} />
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>{article.date}</Text>
        </View>

        {/* ── Title ──────────────────── */}
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, lineHeight: 32, marginTop: 12 }}>
          {article.title}
        </Text>

        {/* ── Source Credit ──────────── */}
        <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 8, marginBottom: 20 }}>
          Source: {article.source} &middot; {article.sourceSlug.replace(/_/g, ' ')}
        </Text>

        {/* ── Body ───────────────────── */}
        {article.body.map((paragraph, i) => (
          <Text
            key={i}
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              lineHeight: theme.lineHeights.body,
              marginBottom: 16,
            }}
          >
            {paragraph}
          </Text>
        ))}

        {/* ── Key Takeaways ──────────── */}
        <View style={[styles.takeawaysBox, { backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.lg, borderColor: theme.colors.primary }]}>
          <View style={styles.takeawaysHeader}>
            <Ionicons name="pin" size={16} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.bold, marginLeft: 6 }}>
              Key Takeaways
            </Text>
          </View>
          {article.keyTakeaways.map((point, i) => (
            <View key={i} style={styles.takeawayRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.safe.icon} style={{ marginTop: 2 }} />
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, lineHeight: theme.lineHeights.body, marginLeft: 8, flex: 1 }}>
                {point}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Related Tips ───────────── */}
        {relatedArticles.length > 0 && (
          <>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, marginTop: 28, marginBottom: 12 }}>
              Related Tips
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
              {relatedArticles.map((related) => (
                <TouchableOpacity
                  key={related.id}
                  onPress={() => router.push(`/article/${related.id}`)}
                  activeOpacity={0.7}
                  style={[styles.relatedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: theme.radius.lg, ...theme.shadows.sm }]}
                >
                  <View style={[styles.relatedIcon, { backgroundColor: theme.colors.primaryLight }]}>
                    <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={[styles.relatedCat, { backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.full }]}>
                    <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: theme.fontWeights.semibold }}>{related.category}</Text>
                  </View>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginTop: 8 }} numberOfLines={2}>
                    {related.title}
                  </Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, marginTop: 4 }}>
                    {related.readTime}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Share Button ───────────── */}
        <TouchableOpacity
          onPress={() => Alert.alert('Share', `Share article: ${article.title}`)}
          style={[styles.shareBtn, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
          accessibilityRole="button"
        >
          <Ionicons name="share-social-outline" size={20} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginLeft: 8 }}>
            Share Article
          </Text>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
  backBtn: { padding: 8 },
  iconBtn: { padding: 8 },
  hero: { height: 200, justifyContent: 'center', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catPill: { paddingHorizontal: 10, paddingVertical: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  takeawaysBox: { padding: 16, marginTop: 8, marginBottom: 8, borderLeftWidth: 3 },
  takeawaysHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  takeawayRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  relatedCard: { width: 180, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  relatedIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  relatedCat: { paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 8 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderWidth: 1.5, marginTop: 28 },
});
