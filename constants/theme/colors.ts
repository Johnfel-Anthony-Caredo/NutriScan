/**
 * NutriScan Neo-Brutalist Color System
 *
 * Medical Teal (#00897B) primary with Deep Black (#0A0A0A) borders/shadows/text.
 * Mint Tint (#E0F2F1) for card and screen backgrounds.
 * Light mode only — high contrast, no dark theme.
 */

// ── Primary: Medical Teal ──────────────────────────────────────────
export const teal = {
  50: '#E0F2F1',
  100: '#B2DFDB',
  200: '#80CBC4',
  300: '#4DB6AC',
  400: '#26A69A',
  500: '#00897B', // Medical Teal — primary brand color
  600: '#00695C',
  700: '#004D40',
  800: '#00352C',
  900: '#002019',
} as const;

export const medicalTeal = teal[500];   // #00897B
export const medicalTealDark = teal[600];  // #00695C
export const medicalTealLight = teal[400]; // #26A69A

// ── Neo-Brutalist Core ─────────────────────────────────────────────
export const deepBlack = '#0A0A0A';
export const mintTint = '#E0F2F1';

// ── Semantic / Verdict Colors ──────────────────────────────────────
export const warningCoral = '#FF6B57';
export const cautionYellow = '#FFD54F';
export const successGreen = '#2E7D32';

export const safe = {
  bg: '#E8F8EE',
  text: '#1B7A3D',
  border: '#2E7D32',
  icon: '#2E7D32',
} as const;

export const caution = {
  bg: '#FFF7E6',
  text: '#946200',
  border: '#FFD54F',
  icon: '#FFD54F',
} as const;

export const avoid = {
  bg: '#FFF0EE',
  text: '#C0392B',
  border: '#FF6B57',
  icon: '#FF6B57',
} as const;

export const invalid = {
  bg: '#F3F4F6',
  text: '#6B7280',
  border: '#D1D5DB',
  icon: '#9CA3AF',
} as const;

// ── Neutral Scale ──────────────────────────────────────────────────
export const neutral = {
  0: '#FFFFFF',
  50: '#FAFAF8',
  100: '#F5F5F0',
  200: '#EDECE7',
  300: '#DDDCD6',
  400: '#B8B7B1',
  500: '#8E8D87',
  600: '#6B6A65',
  700: '#4A4944',
  800: '#2D2C28',
  900: '#1A1918',
} as const;

// ── Light Theme (only) ─────────────────────────────────────────────
export const colors = {
  // Surfaces
  background: mintTint,
  surface: neutral[0],
  surfaceSecondary: teal[50],
  surfaceElevated: neutral[0],

  // Text
  textPrimary: deepBlack,
  textSecondary: neutral[600],
  textTertiary: neutral[500],
  textInverse: neutral[0],

  // Primary
  primary: medicalTeal,
  primaryLight: teal[50],
  primaryDark: medicalTealDark,

  // Borders (all deep black for brutalist feel)
  border: deepBlack,
  borderLight: deepBlack,
  divider: deepBlack,

  // Tab bar
  tabBar: neutral[0],
  tabBarBorder: deepBlack,
  tabIconDefault: neutral[400],
  tabIconActive: medicalTeal,

  // Verdicts
  safe,
  caution,
  avoid,
  invalid,

  // Misc
  overlay: 'rgba(10, 10, 10, 0.45)',
  shadow: deepBlack,
} as const;

export type ThemeColors = typeof colors;
