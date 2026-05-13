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
  /** 0-1, AI confidence in food identification */
  confidence?: number;
  /** Portion recommendation hint */
  portionGuidance?: string;
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

// ── Chat History ────────────────────────────────────────────────────

export interface ChatConversation {
  id: string;
  preview: string;
  messageCount: number;
  createdAt: string;
}

export const MOCK_CHAT_HISTORY: { date: string; conversations: ChatConversation[] }[] = [
  {
    date: 'Today',
    conversations: [
      { id: 'c1', preview: 'Is instant ramen safe for me?', messageCount: 4, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'c2', preview: 'What should I eat for breakfast?', messageCount: 6, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
  },
  {
    date: 'Yesterday',
    conversations: [
      { id: 'c3', preview: 'Explain my last scan', messageCount: 3, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    date: 'April 28',
    conversations: [
      { id: 'c4', preview: 'What foods are high in sodium?', messageCount: 5, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'c5', preview: 'Give me a healthy merienda idea', messageCount: 4, createdAt: new Date(Date.now() - 3 * 86400000 - 3600000).toISOString() },
    ],
  },
];

// ── Health Summary Report ───────────────────────────────────────────

export interface DailyCalorie {
  day: string;
  consumed: number;
  goal: number;
}

export interface NutrientAverage {
  label: string;
  avgValue: number;
  limit: number;
  unit: string;
  overLimit: boolean;
}

export interface HealthReport {
  period: string;
  totalScans: number;
  safe: number;
  caution: number;
  avoid: number;
  calories: DailyCalorie[];
  nutrientAverages: NutrientAverage[];
  riskyFoods: { name: string; count: number; tag: string }[];
}

export const MOCK_HEALTH_REPORT: HealthReport = {
  period: 'Last 7 Days',
  totalScans: 19,
  safe: 12,
  caution: 5,
  avoid: 2,
  calories: [
    { day: 'Mon', consumed: 1850, goal: 2000 },
    { day: 'Tue', consumed: 2100, goal: 2000 },
    { day: 'Wed', consumed: 1600, goal: 2000 },
    { day: 'Thu', consumed: 1950, goal: 2000 },
    { day: 'Fri', consumed: 1750, goal: 2000 },
    { day: 'Sat', consumed: 1400, goal: 2000 },
    { day: 'Sun', consumed: 1200, goal: 2000 },
  ],
  nutrientAverages: [
    { label: 'Sodium', avgValue: 1800, limit: 1500, unit: 'mg', overLimit: true },
    { label: 'Sugar', avgValue: 22, limit: 25, unit: 'g', overLimit: false },
    { label: 'Saturated Fat', avgValue: 15, limit: 13, unit: 'g', overLimit: true },
    { label: 'Fiber', avgValue: 18, limit: 30, unit: 'g', overLimit: false },
  ],
  riskyFoods: [
    { name: 'Instant Ramen Noodles', count: 3, tag: 'HIGH SODIUM' },
    { name: 'Fried Chicken', count: 2, tag: 'HIGH FAT' },
    { name: 'White Bread', count: 5, tag: 'MODERATE SODIUM' },
  ],
};

// ── Full Article Data ───────────────────────────────────────────────

export interface ArticleData {
  id: string;
  title: string;
  category: string;
  readTime: string;
  source: string;
  sourceSlug: string;
  date: string;
  body: string[];
  keyTakeaways: string[];
  relatedIds: string[];
}

export const MOCK_ARTICLES: Record<string, ArticleData> = {
  '1': {
    id: '1',
    title: 'Managing Blood Sugar with Fiber',
    category: 'Diabetes',
    readTime: '5 min read',
    source: 'Wikipedia',
    sourceSlug: 'Diabetic_diet',
    date: 'April 28, 2026',
    body: [
      'Dietary fiber, also known as roughage, is the portion of plant-derived food that cannot be completely broken down by human digestive enzymes. It plays a crucial role in managing blood sugar levels, particularly for individuals with diabetes or prediabetes.',
      'Soluble fiber, found in oats, beans, lentils, and fruits, dissolves in water to form a gel-like substance. This gel slows the absorption of sugar into the bloodstream, helping prevent rapid spikes in blood glucose after meals. Studies have shown that a diet high in soluble fiber can reduce hemoglobin A1c levels by 0.5% to 1%.',
      'Insoluble fiber, found in whole grains, nuts, and vegetables, does not dissolve in water. While it does not directly lower blood sugar, it promotes digestive health and helps maintain a feeling of fullness, which can prevent overeating and assist with weight management — another key factor in diabetes control.',
      'The American Diabetes Association recommends consuming 25 to 30 grams of fiber per day from food sources. Good sources include: oatmeal (4g per cup), black beans (15g per cup), avocado (10g per fruit), broccoli (5g per cup), and chia seeds (10g per ounce).',
      'When increasing fiber intake, it is important to do so gradually and drink plenty of water to avoid digestive discomfort. Pairing fiber-rich foods with lean proteins and healthy fats can further help stabilize blood sugar levels throughout the day.',
    ],
    keyTakeaways: [
      'Soluble fiber slows sugar absorption and can reduce A1c by up to 1%',
      'Aim for 25-30g of fiber daily from whole foods like oats, beans, and avocados',
      'Increase fiber intake gradually with plenty of water to avoid digestive issues',
    ],
    relatedIds: ['2', '4'],
  },
  '2': {
    id: '2',
    title: 'Understanding Sodium Labels',
    category: 'Hypertension',
    readTime: '4 min read',
    source: 'Wikipedia',
    sourceSlug: 'Sodium_in_diet',
    date: 'April 27, 2026',
    body: [
      'Sodium is an essential mineral that helps maintain fluid balance and supports nerve and muscle function. However, excessive sodium intake is a major risk factor for hypertension (high blood pressure), heart disease, and kidney disease.',
      'The World Health Organization recommends a daily sodium intake of less than 2,000mg (about 5g of salt) for adults. For individuals with hypertension, the recommendation is even lower — typically less than 1,500mg per day.',
      'Reading nutrition labels is the most effective way to control sodium intake. Key terms to watch for include: "sodium-free" (less than 5mg per serving), "low sodium" (140mg or less), "reduced sodium" (at least 25% less than original), and "no salt added" (no salt added during processing, but may still contain natural sodium).',
      'Hidden sources of sodium include bread, processed meats, canned soups, condiments like soy sauce and ketchup, cheese, and fast food. A single serving of instant ramen can contain over 1,800mg of sodium — exceeding the entire daily limit for someone with hypertension.',
      'Practical strategies for reducing sodium include: cooking at home with herbs and spices instead of salt, choosing fresh or frozen vegetables over canned, rinsing canned beans and vegetables before use, and requesting low-sodium options when dining out.',
    ],
    keyTakeaways: [
      'Keep daily sodium under 1,500mg if you have hypertension',
      'Watch for hidden sodium in bread, processed meats, and canned foods',
      'Use herbs and spices instead of salt when cooking at home',
    ],
    relatedIds: ['1', '3'],
  },
  '3': {
    id: '3',
    title: 'Kidney-Friendly Snack Ideas',
    category: 'Kidney Disease',
    readTime: '3 min read',
    source: 'Wikipedia',
    sourceSlug: 'Renal_diet',
    date: 'April 26, 2026',
    body: [
      'A renal diet is designed to reduce the workload on the kidneys by limiting certain nutrients that can accumulate in the blood when kidney function is impaired. The key nutrients to monitor include potassium, phosphorus, sodium, and protein.',
      'Finding satisfying snacks on a renal diet can be challenging, but there are many delicious options available. Low-potassium fruits like apples, berries, grapes, and pineapple make excellent snack choices.',
      'Other kidney-friendly snacks include unsalted rice cakes, plain popcorn (without added salt or butter), carrot and celery sticks with a small amount of cream cheese, and homemade trail mix with unsalted pretzels and dried cranberries.',
      'It is important to control portion sizes even with kidney-friendly foods, as consuming large amounts of any food can overwhelm compromised kidneys. Working with a registered dietitian who specializes in renal nutrition can help create a personalized snack plan.',
    ],
    keyTakeaways: [
      'Choose low-potassium fruits: apples, berries, grapes, pineapple',
      'Unsalted rice cakes and plain popcorn are safe kidney-friendly snacks',
      'Control portions even with safe foods — work with a renal dietitian',
    ],
    relatedIds: ['2', '4'],
  },
  '4': {
    id: '4',
    title: 'Hidden Sugars in Everyday Foods',
    category: 'Diabetes',
    readTime: '4 min read',
    source: 'Wikipedia',
    sourceSlug: 'Added_sugar',
    date: 'April 25, 2026',
    body: [
      'Added sugars are sugars and syrups that are added to foods during processing or preparation. Unlike naturally occurring sugars found in fruits and milk, added sugars contribute calories without essential nutrients and can significantly impact blood sugar levels.',
      'Many foods that appear healthy contain surprisingly high amounts of added sugar. Flavored yogurt can contain up to 20g of added sugar per serving, fruit juice often has as much sugar as soda, and granola bars frequently contain 10-15g of sugar.',
      'Other common sources of hidden sugar include pasta sauce (up to 12g per half cup), salad dressings, instant oatmeal packets, dried fruits, and condiments like ketchup and barbecue sauce.',
      'The American Heart Association recommends limiting added sugar to no more than 25g (6 teaspoons) per day for women and 36g (9 teaspoons) per day for men. For individuals managing diabetes, even lower limits may be appropriate.',
      'To reduce hidden sugar intake: read nutrition labels carefully, choose plain versions of yogurt and oatmeal, opt for whole fruits instead of juice, and cook sauces at home where you can control the sugar content.',
    ],
    keyTakeaways: [
      'Flavored yogurt, juice, and granola bars often contain 15-20g of hidden sugar',
      'Limit added sugar to 25g/day (women) or 36g/day (men)',
      'Choose plain versions and read labels — "healthy" foods can be sugar traps',
    ],
    relatedIds: ['1', '3'],
  },
};

