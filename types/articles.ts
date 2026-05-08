/**
 * NutriScan Article Types
 *
 * Normalized article shape for the Health Tips carousel
 * and Article Detail screen, backed by Wikipedia API.
 */

/** Condition → Wikipedia slugs to fetch */
export const CONDITION_ARTICLE_SLUGS: Record<string, string[]> = {
  diabetes: ['Diabetic_diet', 'Glycemic_index', 'Blood_sugar', 'Low-carbohydrate_diet'],
  hypertension: ['Hypertension', 'DASH_diet', 'Sodium_in_diet'],
  kidney_disease: ['Renal_diet', 'Potassium', 'Phosphorus_in_biology'],
  heart_disease: ['Saturated_fat', 'Mediterranean_diet', 'Omega-3_fatty_acid'],
  liver_disease: ['Hepatic_diet', 'Cirrhosis', 'Fatty_liver_disease'],
  cancer: ['Healthy_diet', 'Antioxidant', 'Malnutrition'],
  other: ['Nutrition_facts_label', 'Ultra-processed_food', 'Food_safety'],
  unsure: ['Nutrition_facts_label', 'Healthy_diet', 'Food_safety'],
};

/** All unique slugs across all conditions */
export function getAllSlugs(): string[] {
  const seen = new Set<string>();
  Object.values(CONDITION_ARTICLE_SLUGS).forEach((slugs) => {
    slugs.forEach((s) => seen.add(s));
  });
  return Array.from(seen);
}

/** Normalized article used by carousel and detail screen */
export interface Article {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  sourceUrl: string;
  keyTakeaways: string[];
  relatedSlugs: string[];
}

/** Row shape from Supabase article_cache table */
export interface ArticleCacheRow {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url: string | null;
  source_url: string;
  key_takeaways: string[];
  related_slugs: string[];
  fetched_at: string;
}
