import type { ScanResultData } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import type { HealthCondition, HealthGoal, NutrientTarget, Verdict } from '@/types/health';

export interface ScanLogRow {
  id: string;
  user_id: string;
  food_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
  verdict: Verdict;
  reason?: string | null;
  image_url?: string | null;
  scanned_at: string;
  source: 'photo' | 'barcode' | 'manual';
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, user_conditions(*), user_nutrient_targets(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: {
  name?: string;
  age?: number;
  blood_type?: string;
  avatar_url?: string;
  height_cm?: number;
  weight_kg?: number;
  goals?: HealthGoal[];
  nutribot_note?: string;
  onboarding_completed?: boolean;
  custom_condition?: string;
  condition_source?: 'listed' | 'other' | 'unsure_ai';
  ai_suggested_condition?: HealthCondition;
}) {
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function upsertUserConditions(userId: string, conditions: HealthCondition[]) {
  await supabase.from('user_conditions').delete().eq('user_id', userId);
  if (conditions.length === 0) return;

  const { error } = await supabase.from('user_conditions').insert(
    conditions.map((condition) => ({ user_id: userId, condition }))
  );

  if (error) throw error;
}

export async function upsertNutrientTargets(userId: string, targets: NutrientTarget[]) {
  await supabase.from('user_nutrient_targets').delete().eq('user_id', userId);
  if (targets.length === 0) return;

  const { error } = await supabase.from('user_nutrient_targets').insert(
    targets.map((target) => ({
      user_id: userId,
      nutrient: target.nutrient,
      daily_limit: target.dailyLimit,
      unit: target.unit,
    }))
  );

  if (error) throw error;
}

export async function insertScanLog(
  userId: string,
  result: ScanResultData,
  source: 'photo' | 'barcode' | 'manual',
  imageUrl?: string
) {
  const { data, error } = await supabase
    .from('scan_logs')
    .insert({
      user_id: userId,
      food_name: result.foodName,
      meal_type: result.mealType,
      verdict: result.verdict,
      reason: result.explanation,
      image_url: imageUrl,
      source,
      nutrients: result.nutrients,
      alternatives: result.alternatives ?? [],
      scanned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScanLogRow;
}

export async function getTodaysScanLogs(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('scanned_at', start.toISOString())
    .order('scanned_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ScanLogRow[];
}

export async function getWeeklyScanLogs(userId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('scanned_at', sevenDaysAgo.toISOString())
    .order('scanned_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ScanLogRow[];
}

export async function getAllUserScans(userId: string) {
  const { data, error } = await supabase
    .from('scan_logs')
    .select('scanned_at, verdict')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}


export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageData {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*, chat_messages(count)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ChatMessageData[];
}

export async function createConversation(userId: string, firstMessage: string) {
  const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) throw error;
  return data as ChatConversation;
}

export async function insertMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  const { error: msgError } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, role, content });

  if (msgError) throw msgError;

  await supabase
    .from('chat_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}

// ── Article Cache ──────────────────────────────────────────────────

export async function getCachedArticles(condition?: string): Promise<ArticleCacheRow[]> {
  let query = supabase
    .from('article_cache')
    .select('*')
    .order('fetched_at', { ascending: false });

  if (condition) {
    query = query.eq('category', condition);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ArticleCacheRow[];
}

export async function getArticleBySlug(slug: string): Promise<ArticleCacheRow | null> {
  const { data, error } = await supabase
    .from('article_cache')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as ArticleCacheRow;
}

export async function upsertArticleCache(articles: {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url: string | null;
  source_url: string;
  key_takeaways: string[];
  related_slugs: string[];
}[]) {
  const { error } = await supabase
    .from('article_cache')
    .upsert(articles, { onConflict: 'slug' });

  if (error) throw error;
}
