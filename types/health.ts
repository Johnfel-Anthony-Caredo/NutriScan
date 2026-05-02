/**
 * NutriScan Health Domain Types
 *
 * These types power the personalization engine — conditions selected
 * during onboarding drive the verdict logic on every scan.
 */

/** Health conditions the user may be managing */
export type HealthCondition =
  | 'diabetes'
  | 'hypertension'
  | 'heart_disease'
  | 'kidney_disease'
  | 'liver_disease'
  | 'cancer'
  | 'other'
  | 'unsure';

/** Display label map for conditions */
export const conditionLabels: Record<HealthCondition, string> = {
  diabetes: 'Diabetes',
  hypertension: 'Hypertension',
  heart_disease: 'Heart Disease',
  kidney_disease: 'Kidney Disease',
  liver_disease: 'Liver Disease',
  cancer: 'Cancer',
  other: 'Other',
  unsure: 'Not Sure',
};

/** Friendly descriptions shown on the confirmation screen */
export const conditionDescriptions: Record<HealthCondition, string> = {
  diabetes: 'We\'ll watch sugar, carbs, and glycemic index for you.',
  hypertension: 'We\'ll flag high-sodium and processed foods.',
  heart_disease: 'We\'ll monitor cholesterol, saturated fat, and sodium.',
  kidney_disease: 'We\'ll track potassium, phosphorus, and protein levels.',
  liver_disease: 'We\'ll watch for high-fat, processed, and high-sodium items.',
  cancer: 'We\'ll focus on anti-inflammatory and nutrient-dense guidance.',
  other: 'We\'ll provide general balanced nutrition guidance.',
  unsure: 'We\'ll give you broad, healthy eating guidance.',
};

/** The three-tier verdict system */
export type Verdict = 'safe' | 'caution' | 'avoid';

/** Display labels for verdicts */
export const verdictLabels: Record<Verdict, string> = {
  safe: 'Safe',
  caution: 'Caution',
  avoid: 'Avoid',
};

// ── Health Goals ────────────────────────────────────────────────────

export type HealthGoal =
  | 'lower_sugar'
  | 'reduce_sodium'
  | 'manage_weight'
  | 'cut_fat'
  | 'protect_kidneys'
  | 'avoid_processed'
  | 'protect_heart'
  | 'doctor_other';

export const goalLabels: Record<HealthGoal, string> = {
  lower_sugar: 'Lower my sugar',
  reduce_sodium: 'Reduce salt & sodium',
  manage_weight: 'Manage my weight',
  cut_fat: 'Cut down on fatty foods',
  protect_kidneys: 'Protect my kidneys',
  avoid_processed: 'Avoid processed junk food',
  protect_heart: 'Protect my heart',
  doctor_other: 'My doctor said something else',
};

export const goalIcons: Record<HealthGoal, string> = {
  lower_sugar: '🍬',
  reduce_sodium: '🧂',
  manage_weight: '⚖️',
  cut_fat: '🥑',
  protect_kidneys: '💧',
  avoid_processed: '🚫',
  protect_heart: '❤️',
  doctor_other: '🩺',
};

// ── Nutrients ───────────────────────────────────────────────────────

export type MonitoredNutrient =
  | 'sugar'
  | 'sodium'
  | 'calories'
  | 'saturated_fat'
  | 'cholesterol'
  | 'potassium'
  | 'phosphorus'
  | 'protein'
  | 'carbohydrates'
  | 'fiber';

export interface NutrientTarget {
  nutrient: MonitoredNutrient;
  label: string;
  dailyLimit: number;
  unit: string;
}

/** Default daily targets derived from conditions */
export const nutrientLabels: Record<MonitoredNutrient, string> = {
  sugar: 'Sugar',
  sodium: 'Sodium',
  calories: 'Calories',
  saturated_fat: 'Saturated Fat',
  cholesterol: 'Cholesterol',
  potassium: 'Potassium',
  phosphorus: 'Phosphorus',
  protein: 'Protein',
  carbohydrates: 'Carbs',
  fiber: 'Fiber',
};

// ── Condition → Nutrient Mapping ────────────────────────────────────

/**
 * Maps each condition to the nutrients NutriScan should monitor.
 * Used to auto-generate the nutrient watchlist during onboarding.
 */
export const conditionNutrientMap: Record<HealthCondition, NutrientTarget[]> = {
  diabetes: [
    { nutrient: 'sugar', label: 'Sugar', dailyLimit: 25, unit: 'g' },
    { nutrient: 'carbohydrates', label: 'Carbs', dailyLimit: 200, unit: 'g' },
    { nutrient: 'fiber', label: 'Fiber', dailyLimit: 30, unit: 'g' },
  ],
  hypertension: [
    { nutrient: 'sodium', label: 'Sodium', dailyLimit: 1500, unit: 'mg' },
    { nutrient: 'potassium', label: 'Potassium', dailyLimit: 3500, unit: 'mg' },
  ],
  heart_disease: [
    { nutrient: 'cholesterol', label: 'Cholesterol', dailyLimit: 200, unit: 'mg' },
    { nutrient: 'saturated_fat', label: 'Saturated Fat', dailyLimit: 13, unit: 'g' },
    { nutrient: 'sodium', label: 'Sodium', dailyLimit: 1500, unit: 'mg' },
  ],
  kidney_disease: [
    { nutrient: 'potassium', label: 'Potassium', dailyLimit: 2000, unit: 'mg' },
    { nutrient: 'phosphorus', label: 'Phosphorus', dailyLimit: 800, unit: 'mg' },
    { nutrient: 'protein', label: 'Protein', dailyLimit: 50, unit: 'g' },
    { nutrient: 'sodium', label: 'Sodium', dailyLimit: 1500, unit: 'mg' },
  ],
  liver_disease: [
    { nutrient: 'sodium', label: 'Sodium', dailyLimit: 1500, unit: 'mg' },
    { nutrient: 'saturated_fat', label: 'Saturated Fat', dailyLimit: 15, unit: 'g' },
    { nutrient: 'protein', label: 'Protein', dailyLimit: 60, unit: 'g' },
  ],
  cancer: [
    { nutrient: 'calories', label: 'Calories', dailyLimit: 2200, unit: 'kcal' },
    { nutrient: 'protein', label: 'Protein', dailyLimit: 75, unit: 'g' },
    { nutrient: 'fiber', label: 'Fiber', dailyLimit: 30, unit: 'g' },
  ],
  other: [
    { nutrient: 'calories', label: 'Calories', dailyLimit: 2000, unit: 'kcal' },
    { nutrient: 'sodium', label: 'Sodium', dailyLimit: 2300, unit: 'mg' },
  ],
  unsure: [
    { nutrient: 'calories', label: 'Calories', dailyLimit: 2000, unit: 'kcal' },
    { nutrient: 'sodium', label: 'Sodium', dailyLimit: 2300, unit: 'mg' },
    { nutrient: 'sugar', label: 'Sugar', dailyLimit: 50, unit: 'g' },
  ],
};

/**
 * Given selected conditions, return a de-duplicated nutrient watchlist.
 * Uses the most restrictive (lowest) limit when the same nutrient
 * appears across multiple conditions.
 */
export function buildNutrientTargets(conditions: HealthCondition[]): NutrientTarget[] {
  const map = new Map<MonitoredNutrient, NutrientTarget>();

  for (const condition of conditions) {
    const targets = conditionNutrientMap[condition] ?? [];
    for (const target of targets) {
      const existing = map.get(target.nutrient);
      if (!existing || target.dailyLimit < existing.dailyLimit) {
        map.set(target.nutrient, target);
      }
    }
  }

  return Array.from(map.values());
}

/** User health profile — built during onboarding */
export interface UserHealthProfile {
  conditions: HealthCondition[];
  goals: HealthGoal[];
  nutrientTargets: NutrientTarget[];
  nutriBotNote?: string;
  onboardingCompleted: boolean;
}

/** Default empty profile */
export const DEFAULT_PROFILE: UserHealthProfile = {
  conditions: [],
  goals: [],
  nutrientTargets: [],
  nutriBotNote: undefined,
  onboardingCompleted: false,
};

/** A scanned food item */
export interface FoodItem {
  id: string;
  user_id?: string;
  name: string;
  verdict: Verdict;
  imageUri?: string;
  image_url?: string;
  scannedAt: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
