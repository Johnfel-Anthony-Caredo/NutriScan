/**
 * articles-fetch — Supabase Edge Function
 *
 * Accepts an array of Wikipedia slugs, fetches each from the
 * Wikipedia REST API /page/summary/{slug} endpoint, normalizes
 * to the NutriScan Article shape, and returns them.
 *
 * The calling client is responsible for caching the results in
 * the article_cache table.
 *
 * POST /articles-fetch
 * Body: { slugs: string[] }
 * Response: { articles: Article[] }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function inferCategory(title: string, extract: string): string {
  const text = `${title} ${extract}`.toLowerCase()
  if (text.includes('diabet') || text.includes('glucose') || text.includes('blood sugar') || text.includes('glycemic') || text.includes('carb')) return 'diabetes'
  if (text.includes('hypertension') || text.includes('blood pressure') || text.includes('sodium') || text.includes('salt')) return 'hypertension'
  if (text.includes('kidney') || text.includes('renal') || text.includes('potassium') || text.includes('phosphorus')) return 'kidney_disease'
  if (text.includes('heart') || text.includes('cholesterol') || text.includes('saturated fat') || text.includes('mediterranean') || text.includes('omega')) return 'heart_disease'
  if (text.includes('liver') || text.includes('hepatic') || text.includes('cirrhosis') || text.includes('fatty liver')) return 'liver_disease'
  if (text.includes('cancer') || text.includes('antioxidant') || text.includes('malnutrition')) return 'cancer'
  if (text.includes('food') || text.includes('nutrition') || text.includes('diet') || text.includes('healthy')) return 'other'
  return 'other'
}

function extractTakeaways(text: string): string[] {
  const sentences = text.split(/[.!\n]/).filter(Boolean).map((s) => s.trim()).filter((s) => s.length > 20)
  return sentences.slice(0, 3).map((s) => {
    const clean = s.replace(/^["'\s]+|["'\s]+$/g, '')
    return clean.length > 150 ? clean.slice(0, 147) + '...' : clean
  })
}

function getRelatedSlugs(slug: string): string[] {
  const map: Record<string, string[]> = {
    Diabetic_diet: ['Glycemic_index', 'Blood_sugar'],
    Glycemic_index: ['Diabetic_diet', 'Low-carbohydrate_diet'],
    Blood_sugar: ['Diabetic_diet', 'Glycemic_index'],
    'Low-carbohydrate_diet': ['Diabetic_diet', 'Glycemic_index'],
    Hypertension: ['DASH_diet', 'Sodium_in_diet'],
    DASH_diet: ['Hypertension', 'Sodium_in_diet'],
    Sodium_in_diet: ['Hypertension', 'DASH_diet'],
    Renal_diet: ['Potassium', 'Phosphorus_in_biology'],
    Potassium: ['Renal_diet', 'Phosphorus_in_biology'],
    Phosphorus_in_biology: ['Renal_diet', 'Potassium'],
    Saturated_fat: ['Mediterranean_diet', 'Omega-3_fatty_acid'],
    Mediterranean_diet: ['Saturated_fat', 'Omega-3_fatty_acid'],
    'Omega-3_fatty_acid': ['Saturated_fat', 'Mediterranean_diet'],
    Hepatic_diet: ['Cirrhosis', 'Fatty_liver_disease'],
    Cirrhosis: ['Hepatic_diet', 'Fatty_liver_disease'],
    Fatty_liver_disease: ['Hepatic_diet', 'Cirrhosis'],
    Healthy_diet: ['Nutrition_facts_label', 'Food_safety'],
    Antioxidant: ['Healthy_diet', 'Nutrition_facts_label'],
    Malnutrition: ['Healthy_diet', 'Nutrition_facts_label'],
    Nutrition_facts_label: ['Food_safety', 'Ultra-processed_food'],
    'Ultra-processed_food': ['Nutrition_facts_label', 'Food_safety'],
    Food_safety: ['Nutrition_facts_label', 'Ultra-processed_food'],
  }
  return map[slug] ?? []
}

async function fetchWikipediaSummary(slug: string): Promise<{
  title: string
  extract: string
  thumbnail: string | null
  sourceUrl: string
} | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NutriScan/1.0 (nutrition app)' },
    })

    if (!response.ok) {
      console.warn(`Wikipedia fetch failed for ${slug}: ${response.status}`)
      return null
    }

    const data = await response.json()
    if (!data || data.type === 'disambiguation' || !data.extract) {
      return null
    }

    return {
      title: data.title ?? slug.replace(/_/g, ' '),
      extract: data.extract ?? '',
      thumbnail: data.thumbnail?.source ?? null,
      sourceUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${slug}`,
    }
  } catch (err) {
    console.error(`Wikipedia fetch error for ${slug}:`, err)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { slugs } = body

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing slugs array' }), { status: 400, headers: corsHeaders })
    }

    const results = await Promise.allSettled(slugs.map((slug: string) => fetchWikipediaSummary(slug)))

    const articles = results
      .map((result, i) => {
        if (result.status !== 'fulfilled' || !result.value) return null

        const data = result.value
        const slug = slugs[i]
        const extract = data.extract

        return {
          slug,
          title: data.title,
          category: inferCategory(data.title, extract),
          summary: extract.length > 300 ? extract.slice(0, 297) + '...' : extract,
          content: extract,
          imageUrl: data.thumbnail,
          sourceUrl: data.sourceUrl,
          keyTakeaways: extractTakeaways(extract),
          relatedSlugs: getRelatedSlugs(slug),
        }
      })
      .filter(Boolean)

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Articles fetch error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
