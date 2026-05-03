/**
 * scanService — frontend service for AI photo scan & barcode lookup.
 *
 * Handles two pipelines:
 * 1. Photo scan → upload image → call scan-ai Edge Function → return result
 * 2. Barcode scan → call Open Food Facts API → optional enrichment via scan-ai → return result
 */

import type { NutrientInfo, ScanResultData } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import type { HealthCondition, HealthGoal, NutrientTarget, Verdict } from '@/types/health';

// ── Types ──────────────────────────────────────────────────────────

export interface BarcodeProductData {
  productName: string;
  barcode: string;
  nutrients: Record<string, number>;
  servingSize?: string;
  imageUrl?: string;
  ingredients?: string;
}

export interface ScanAiResponse {
  foodName: string;
  verdict: Verdict;
  explanation: string;
  safeMessage?: string;
  reasoningSummary: string[];
  alternatives: { name: string; verdict: Verdict }[];
  nutrients: NutrientInfo[];
}

// ── Open Food Facts API ─────────────────────────────────────────────

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v2/product';

/**
 * Lookup a barcode via Open Food Facts and return structured product data.
 * Returns null if the barcode is not found.
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeProductData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Open Food Facts returned ${response.status} for barcode ${barcode}`);
      return null;
    }

    const json = await response.json();
    if (json.status !== 1 || !json.product) {
      return null;
    }

    const p = json.product;
    const nutriments = p.nutriments || {};

    // Map Open Food Facts nutrient keys to our format
    const nutrients: Record<string, number> = {};
    const nutrientKeyMap: Record<string, string> = {
      'energy-kcal_100g': 'calories',
      'sugars_100g': 'sugar',
      'sodium_100g': 'sodium',
      'saturated-fat_100g': 'saturated_fat',
      'fiber_100g': 'fiber',
      'proteins_100g': 'protein',
      'carbohydrates_100g': 'carbohydrates',
      'cholesterol_100g': 'cholesterol',
      'potassium_100g': 'potassium',
    };

    for (const [offKey, ourKey] of Object.entries(nutrientKeyMap)) {
      if (nutriments[offKey] !== undefined) {
        nutrients[ourKey] = Math.round(nutriments[offKey] * 100) / 100;
      }
    }

    const servingSize = p.serving_size || undefined;
    const imageUrl = p.image_front_url || p.image_url || undefined;
    const ingredients = p.ingredients_text || undefined;

    return {
      productName: p.product_name || 'Unknown Product',
      barcode,
      nutrients,
      servingSize,
      imageUrl,
      ingredients,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('Open Food Facts request timed out');
    } else {
      console.error('Open Food Facts lookup failed:', error);
    }
    return null;
  }
}

// ── AI Scan (Photo + optional barcode enrichment) ──────────────────

const SCAN_AI_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/scan-ai`;

export interface UserProfileForScan {
  conditions: HealthCondition[];
  goals: HealthGoal[];
  nutrientTargets: NutrientTarget[];
}

/**
 * Call the scan-ai Edge Function with an image and optional barcode data.
 * Returns the parsed scan result data.
 */
export async function analyzeFoodPhoto(
  imageBase64: string,
  mimeType: string,
  userProfile: UserProfileForScan,
  barcodeData?: BarcodeProductData | null,
): Promise<ScanAiResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(SCAN_AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        image: {
          base64: imageBase64,
          mimeType,
        },
        barcodeData: barcodeData
          ? {
              productName: barcodeData.productName,
              nutrients: barcodeData.nutrients,
              servingSize: barcodeData.servingSize,
            }
          : undefined,
        userProfile: {
          conditions: userProfile.conditions,
          goals: userProfile.goals,
          nutrientTargets: userProfile.nutrientTargets.map((t) => ({
            label: t.label,
            dailyLimit: t.dailyLimit,
            unit: t.unit,
          })),
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      let errMsg = 'AI analysis failed';
      try {
        const errJson = JSON.parse(errBody);
        errMsg = errJson.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data as ScanAiResponse;
  } catch (error: any) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Analysis timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Call the scan-ai Edge Function with barcode data only (no photo).
 * Used when barcode lookup succeeded but needs AI enrichment.
 */
export async function analyzeBarcodeWithAi(
  barcodeData: BarcodeProductData,
  userProfile: UserProfileForScan,
): Promise<ScanAiResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(SCAN_AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        barcodeData: {
          productName: barcodeData.productName,
          nutrients: barcodeData.nutrients,
          servingSize: barcodeData.servingSize,
        },
        userProfile: {
          conditions: userProfile.conditions,
          goals: userProfile.goals,
          nutrientTargets: userProfile.nutrientTargets.map((t) => ({
            label: t.label,
            dailyLimit: t.dailyLimit,
            unit: t.unit,
          })),
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      let errMsg = 'AI analysis failed';
      try {
        const errJson = JSON.parse(errBody);
        errMsg = errJson.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data as ScanAiResponse;
  } catch (error: any) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Analysis timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Build a ScanResultData from AI response + user inputs.
 */
export function buildScanResultFromAiResponse(
  aiResponse: ScanAiResponse,
  mealType: string,
  source: 'photo' | 'barcode' | 'manual',
): ScanResultData {
  return {
    id: `scan-${Date.now()}`,
    foodName: aiResponse.foodName,
    verdict: aiResponse.verdict,
    mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    scannedAt: new Date().toISOString(),
    explanation: aiResponse.explanation,
    safeMessage: aiResponse.safeMessage,
    nutrients: aiResponse.nutrients,
    alternatives: aiResponse.alternatives,
  };
}

/**
 * Build a ScanResultData from Open Food Facts data directly (no AI needed).
 * Only used when Open Food Facts has complete enough data.
 */
export function buildScanResultFromBarcode(
  barcodeData: BarcodeProductData,
  mealType: string,
): ScanResultData {
  const nutrients: NutrientInfo[] = [];
  const dailyLimits: Record<string, { limit: number; unit: string }> = {
    sodium: { limit: 2300, unit: 'mg' },
    sugar: { limit: 50, unit: 'g' },
    calories: { limit: 2000, unit: 'kcal' },
    saturated_fat: { limit: 20, unit: 'g' },
    fiber: { limit: 30, unit: 'g' },
    protein: { limit: 50, unit: 'g' },
    carbohydrates: { limit: 300, unit: 'g' },
  };

  for (const [nutrientKey, value] of Object.entries(barcodeData.nutrients)) {
    const dl = dailyLimits[nutrientKey];
    if (dl) {
      const overLimit = value > dl.limit;
      nutrients.push({
        nutrient: nutrientKey as any,
        label: nutrientKey.charAt(0).toUpperCase() + nutrientKey.slice(1).replace('_', ' '),
        value,
        unit: dl.unit,
        dailyLimit: dl.limit,
        overLimit,
        warning: overLimit ? `High ${nutrientKey}` : undefined,
      });
    }
  }

  return {
    id: `barcode-${Date.now()}`,
    foodName: barcodeData.productName,
    verdict: 'caution', // default — AI enrichment may refine this
    mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    scannedAt: new Date().toISOString(),
    explanation: `Product data retrieved from barcode (${barcodeData.barcode}). ${
      nutrients.length > 0
        ? 'Nutrient information is based on package data.'
        : 'Limited nutrient data available from the barcode lookup. Use with caution.'
    }`,
    nutrients,
    alternatives: [],
  };
}

/**
 * Call the scan-ai Edge Function with a food name (text-only, manual search).
 * Used when the user manually typed a food name.
 */
export async function analyzeTextFood(
  foodName: string,
  userProfile: UserProfileForScan,
): Promise<ScanAiResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(SCAN_AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        barcodeData: {
          productName: foodName,
          nutrients: {},
          servingSize: undefined,
        },
        userProfile: {
          conditions: userProfile.conditions,
          goals: userProfile.goals,
          nutrientTargets: userProfile.nutrientTargets.map((t) => ({
            label: t.label,
            dailyLimit: t.dailyLimit,
            unit: t.unit,
          })),
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      let errMsg = 'AI analysis failed';
      try {
        const errJson = JSON.parse(errBody);
        errMsg = errJson.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data as ScanAiResponse;
  } catch (error: any) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Analysis timed out. Please try again.');
    }
    throw error;
  }
}
