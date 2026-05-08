/**
 * articleService — cache-first article fetching for Health Tips.
 *
 * 1. Check Supabase article_cache for cached articles
 * 2. If missing or stale, call articles-fetch Edge Function
 * 3. Normalize and cache the results
 * 4. Return Article[] for carousel / detail screen
 */

import { supabase } from '@/lib/supabase';
import { getArticleBySlug, getCachedArticles, upsertArticleCache } from '@/services/supabaseService';
import { CONDITION_ARTICLE_SLUGS, type Article, type ArticleCacheRow } from '@/types/articles';
import type { HealthCondition } from '@/types/health';

const ARTICLES_FETCH_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/articles-fetch`;

/**
 * Fetch articles for the user's conditions.
 * Cache-first: reads from Supabase article_cache, falls back to Edge Function.
 */
export async function fetchArticlesForConditions(
  conditions: HealthCondition[],
): Promise<Article[]> {
  const conditionsToFetch = conditions.length > 0 ? conditions : ['other'];

  // 1. Read cached articles from Supabase
  let cached: ArticleCacheRow[] = [];
  try {
    const seen = new Set<string>();
    for (const condition of conditionsToFetch) {
      const rows = await getCachedArticles(condition);
      for (const row of rows) {
        if (!seen.has(row.slug)) {
          seen.add(row.slug);
          cached.push(row);
        }
      }
    }
  } catch (err) {
    console.warn('Cache read failed, will fetch from API:', err);
  }

  // 2. Determine which slugs are missing from cache
  const relevantSlugs = conditionsToFetch.flatMap(
    (c) => CONDITION_ARTICLE_SLUGS[c] ?? [],
  );
  const cachedSlugs = new Set(cached.map((r) => r.slug));
  const missingSlugs = relevantSlugs.filter((s) => !cachedSlugs.has(s));

  // 3. Fetch missing slugs via Edge Function
  if (missingSlugs.length > 0) {
    try {
      const newArticles = await callArticlesFetch(missingSlugs);
      if (newArticles.length > 0) {
        // Normalize Article → ArticleCacheRow so the field names match (image_url vs imageUrl, etc.)
        const apiRows: ArticleCacheRow[] = newArticles.map((a) => ({
          slug: a.slug,
          title: a.title,
          category: a.category,
          summary: a.summary,
          content: a.content,
          image_url: a.imageUrl ?? null,
          source_url: a.sourceUrl,
          key_takeaways: a.keyTakeaways ?? [],
          related_slugs: a.relatedSlugs ?? [],
          fetched_at: new Date().toISOString(),
        }));

        await upsertArticleCache(apiRows);
        cached = [...cached, ...apiRows];
      }
    } catch (err) {
      console.warn('API fetch failed, using cached articles only:', err);
    }
  }

  return cached.map(mapCacheRowToArticle);
}

/**
 * Fetch a single article by slug with cache-first approach.
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const cached = await getArticleBySlug(slug);
    if (cached) return mapCacheRowToArticle(cached);
  } catch {
    // Cache miss, fetch fresh
  }

  try {
    const articles = await callArticlesFetch([slug]);
    if (articles.length > 0) {
      const a = articles[0];
      await upsertArticleCache([
        {
          slug: a.slug,
          title: a.title,
          category: a.category,
          summary: a.summary,
          content: a.content,
          image_url: a.imageUrl,
          source_url: a.sourceUrl,
          key_takeaways: a.keyTakeaways,
          related_slugs: a.relatedSlugs,
        },
      ]);
      return a;
    }
  } catch (err) {
    console.warn('Article fetch failed:', err);
  }

  return null;
}

// ── Internal helpers ────────────────────────────────────────────────

function mapCacheRowToArticle(row: ArticleCacheRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    sourceUrl: row.source_url,
    keyTakeaways: row.key_takeaways ?? generateTakeaways(row.summary),
    relatedSlugs: row.related_slugs ?? [],
  };
}

function generateTakeaways(summary: string): string[] {
  if (!summary) return [];
  const sentences = summary
    .split(/[.!\n]/)
    .filter(Boolean)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  return sentences.slice(0, 3).map((s) =>
    s.length > 120 ? s.slice(0, 117) + '...' : s,
  );
}

async function callArticlesFetch(slugs: string[]): Promise<Article[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('No active session');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(ARTICLES_FETCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ slugs }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(errBody || 'Failed to fetch articles');
    }

    const data = await response.json();
    return (data.articles as Article[]) ?? [];
  } catch (err: any) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Article fetch timed out');
    }
    throw err;
  }
}
