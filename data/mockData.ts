/**
 * NutriScan Mock Data — realistic food scan data for UI development.
 *
 * Separates presentation from data so the UI can be built
 * independently from the real backend / AI engine.
 */

import type { Verdict, FoodItem, MonitoredNutrient } from '@/types/health';

// ── Nutrient Data for Scan Results ──────────────────────────────────

export interface NutrientInfo {
  nutrient: MonitoredNutrient;
  label: string;
  value: number;
  unit: string;
  dailyLimit: number;
  /** Whether this nutrient is over the user's daily limit */
  overLimit: boolean;
  /** Condition-aware warning text */
  warning?: string;
}

export interface ScanResultData {
  id: string;
  foodName: string;
  verdict: Verdict;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  scannedAt: string;
  /** Condition-specific explanation of the verdict */
  explanation: string;
  /** Positive message for safe items */
  safeMessage?: string;
  nutrients: NutrientInfo[];
  /** Better alternatives shown for caution/avoid items */
  alternatives?: { name: string; verdict: Verdict }[];
}

// ── Mock Scan Results ───────────────────────────────────────────────

export const MOCK_RESULT_AVOID: ScanResultData = {
  id: '1',
  foodName: 'Instant Ramen Noodles',
  verdict: 'avoid',
  mealType: 'lunch',
  scannedAt: new Date().toISOString(),
  explanation:
    'This item has very high sodium content (1,820mg per serving), which exceeds the recommended daily limit for your hypertension and kidney condition.',
  nutrients: [
    { nutrient: 'sodium', label: 'Sodium', value: 1820, unit: 'mg', dailyLimit: 1500, overLimit: true, warning: 'High sodium for your kidney condition' },
    { nutrient: 'calories', label: 'Calories', value: 380, unit: 'kcal', dailyLimit: 2000, overLimit: false },
    { nutrient: 'saturated_fat', label: 'Saturated Fat', value: 7, unit: 'g', dailyLimit: 13, overLimit: false },
    { nutrient: 'sugar', label: 'Sugar', value: 2, unit: 'g', dailyLimit: 25, overLimit: false },
    { nutrient: 'carbohydrates', label: 'Carbs', value: 52, unit: 'g', dailyLimit: 200, overLimit: false },
    { nutrient: 'protein', label: 'Protein', value: 9, unit: 'g', dailyLimit: 50, overLimit: false },
  ],
  alternatives: [
    { name: 'Brown Rice Bowl', verdict: 'safe' },
    { name: 'Miso Soup (low sodium)', verdict: 'caution' },
    { name: 'Steamed Vegetables with Quinoa', verdict: 'safe' },
  ],
};

export const MOCK_RESULT_CAUTION: ScanResultData = {
  id: '2',
  foodName: 'Whole Wheat Bread',
  verdict: 'caution',
  mealType: 'breakfast',
  scannedAt: new Date().toISOString(),
  explanation:
    'Moderate sodium content per serving. Fine in small amounts, but watch your total daily sodium intake with hypertension.',
  nutrients: [
    { nutrient: 'sodium', label: 'Sodium', value: 230, unit: 'mg', dailyLimit: 1500, overLimit: false, warning: 'Watch sodium intake — adds up through the day' },
    { nutrient: 'calories', label: 'Calories', value: 130, unit: 'kcal', dailyLimit: 2000, overLimit: false },
    { nutrient: 'carbohydrates', label: 'Carbs', value: 24, unit: 'g', dailyLimit: 200, overLimit: false },
    { nutrient: 'fiber', label: 'Fiber', value: 3, unit: 'g', dailyLimit: 30, overLimit: false },
    { nutrient: 'sugar', label: 'Sugar', value: 4, unit: 'g', dailyLimit: 25, overLimit: false },
  ],
  alternatives: [
    { name: 'Oatmeal', verdict: 'safe' },
    { name: 'Rice Cakes (unsalted)', verdict: 'safe' },
  ],
};

export const MOCK_RESULT_SAFE: ScanResultData = {
  id: '3',
  foodName: 'Fresh Avocado',
  verdict: 'safe',
  mealType: 'snack',
  scannedAt: new Date().toISOString(),
  explanation: 'Great choice! Avocado is heart-healthy and packed with good fats and fiber.',
  safeMessage: 'This is a great choice for your health goals. Keep it up! 🎉',
  nutrients: [
    { nutrient: 'calories', label: 'Calories', value: 160, unit: 'kcal', dailyLimit: 2000, overLimit: false },
    { nutrient: 'fiber', label: 'Fiber', value: 7, unit: 'g', dailyLimit: 30, overLimit: false },
    { nutrient: 'sodium', label: 'Sodium', value: 7, unit: 'mg', dailyLimit: 1500, overLimit: false },
    { nutrient: 'potassium', label: 'Potassium', value: 485, unit: 'mg', dailyLimit: 3500, overLimit: false },
    { nutrient: 'sugar', label: 'Sugar', value: 0.7, unit: 'g', dailyLimit: 25, overLimit: false },
  ],
};

// ── Mock Food Log (Today's) ─────────────────────────────────────────

export const MOCK_TODAY_LOG: FoodItem[] = [
  {
    id: '3',
    name: 'Fresh Avocado',
    verdict: 'safe',
    scannedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    mealType: 'snack',
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    verdict: 'caution',
    scannedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    mealType: 'breakfast',
  },
];

// ── Mock Weekly Summary ─────────────────────────────────────────────

export interface WeeklySummary {
  safe: number;
  caution: number;
  avoid: number;
  /** Day-by-day breakdown for chart */
  daily: { day: string; safe: number; caution: number; avoid: number }[];
}

export const MOCK_WEEKLY: WeeklySummary = {
  safe: 12,
  caution: 5,
  avoid: 2,
  daily: [
    { day: 'Mon', safe: 3, caution: 1, avoid: 0 },
    { day: 'Tue', safe: 2, caution: 1, avoid: 1 },
    { day: 'Wed', safe: 2, caution: 0, avoid: 0 },
    { day: 'Thu', safe: 1, caution: 2, avoid: 1 },
    { day: 'Fri', safe: 2, caution: 1, avoid: 0 },
    { day: 'Sat', safe: 1, caution: 0, avoid: 0 },
    { day: 'Sun', safe: 1, caution: 0, avoid: 0 },
  ],
};

// ── Health Tips ─────────────────────────────────────────────────────

export interface HealthTip {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconBg: 'safe' | 'caution' | 'avoid';
}

export const MOCK_TIPS: HealthTip[] = [
  { id: '1', title: 'Managing blood sugar with fiber', subtitle: 'Learn how fiber-rich foods help stabilize glucose levels.', iconName: 'heart', iconBg: 'safe' },
  { id: '2', title: 'Understanding sodium labels', subtitle: 'How to read and interpret sodium content on food packages.', iconName: 'alert-circle', iconBg: 'caution' },
  { id: '3', title: 'Kidney-friendly snack ideas', subtitle: 'Low-potassium snacks that taste great and are safe for you.', iconName: 'leaf', iconBg: 'safe' },
  { id: '4', title: 'Hidden sugars in everyday foods', subtitle: 'Common foods with surprisingly high sugar content.', iconName: 'warning', iconBg: 'avoid' },
];

// ── Mock Search Results ─────────────────────────────────────────────

export interface SearchFoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
}

export const MOCK_SEARCH_RESULTS: SearchFoodItem[] = [
  { id: 's1', name: 'Brown Rice', brand: 'Generic', calories: 216 },
  { id: 's2', name: 'Chicken Breast', brand: 'Fresh', calories: 165 },
  { id: 's3', name: 'Greek Yogurt', brand: 'Fage', calories: 100 },
  { id: 's4', name: 'Sweet Potato', brand: 'Generic', calories: 103 },
  { id: 's5', name: 'Salmon Fillet', brand: 'Fresh', calories: 208 },
  { id: 's6', name: 'Oatmeal', brand: 'Quaker', calories: 150 },
];

export const MOCK_RECENT_SEARCHES = ['Instant Ramen', 'Brown Rice', 'Greek Yogurt'];
