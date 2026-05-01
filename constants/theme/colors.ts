/**
 * NutriScan Color System
 *
 * Medical teal primary palette with warm white surfaces.
 * Verdict colors follow a traffic-light metaphor:
 *   Safe = green, Caution = amber, Avoid = red
 *
 * Every screen surface, text color, and accent is derived from these tokens.
 */

// ── Primary: Medical Teal ──────────────────────────────────────────
export const teal = {
  50: '#E6F7F7',
  100: '#B3EAEA',
  200: '#80DCDC',
  300: '#4DCECE',
  400: '#26C3C3',
  500: '#0D9B8A', // ← primary
  600: '#0B8577',
  700: '#096E63',
  800: '#075750',
  900: '#05403C',
} as const;

// ── Verdict: Safe ──────────────────────────────────────────────────
export const safe = {
  bg: '#E8F8EE',
  text: '#1B7A3D',
  border: '#A8E6BF',
  icon: '#27AE60',
} as const;

// ── Verdict: Caution ───────────────────────────────────────────────
export const caution = {
  bg: '#FFF7E6',
  text: '#946200',
  border: '#FFD580',
  icon: '#F2994A',
} as const;

// ── Verdict: Avoid ─────────────────────────────────────────────────
export const avoid = {
  bg: '#FDECEC',
  text: '#A63D40',
  border: '#F5A3A5',
  icon: '#EB5757',
} as const;

// ── Neutral: Warm-tinted grays ─────────────────────────────────────
export const neutral = {
  0: '#FFFFFF',
  50: '#FAFAF8',   // warm white
  100: '#F5F5F0',  // cream
  200: '#EDECE7',
  300: '#DDDCD6',
  400: '#B8B7B1',
  500: '#8E8D87',
  600: '#6B6A65',
  700: '#4A4944',
  800: '#2D2C28',
  900: '#1A1918',
} as const;

// ── Light Theme ────────────────────────────────────────────────────
export const lightColors = {
  // Surfaces
  background: neutral[50],
  surface: neutral[0],
  surfaceSecondary: neutral[100],
  surfaceElevated: neutral[0],

  // Text
  textPrimary: neutral[900],
  textSecondary: neutral[600],
  textTertiary: neutral[500],
  textInverse: neutral[0],

  // Primary
  primary: teal[500],
  primaryLight: teal[50],
  primaryDark: teal[700],

  // Borders & Dividers
  border: neutral[200],
  borderLight: neutral[100],
  divider: neutral[200],

  // Tab bar
  tabBar: neutral[0],
  tabBarBorder: neutral[200],
  tabIconDefault: neutral[400],
  tabIconActive: teal[500],

  // Verdicts
  safe,
  caution,
  avoid,

  // Misc
  overlay: 'rgba(26, 25, 24, 0.45)',
  shadow: 'rgba(26, 25, 24, 0.08)',
} as const;

// ── Dark Theme ─────────────────────────────────────────────────────
export const darkColors = {
  // Surfaces
  background: '#111110',
  surface: '#1C1C1A',
  surfaceSecondary: '#242422',
  surfaceElevated: '#2A2A28',

  // Text
  textPrimary: '#F0EFEB',
  textSecondary: '#A5A49E',
  textTertiary: '#7A7974',
  textInverse: neutral[900],

  // Primary
  primary: teal[400],
  primaryLight: 'rgba(13, 155, 138, 0.15)',
  primaryDark: teal[300],

  // Borders & Dividers
  border: '#333330',
  borderLight: '#2A2A28',
  divider: '#333330',

  // Tab bar
  tabBar: '#1C1C1A',
  tabBarBorder: '#333330',
  tabIconDefault: '#7A7974',
  tabIconActive: teal[400],

  // Verdicts
  safe: {
    bg: 'rgba(39, 174, 96, 0.12)',
    text: '#5ECB8B',
    border: 'rgba(39, 174, 96, 0.25)',
    icon: '#5ECB8B',
  },
  caution: {
    bg: 'rgba(242, 153, 74, 0.12)',
    text: '#F2C574',
    border: 'rgba(242, 153, 74, 0.25)',
    icon: '#F2C574',
  },
  avoid: {
    bg: 'rgba(235, 87, 87, 0.12)',
    text: '#F08080',
    border: 'rgba(235, 87, 87, 0.25)',
    icon: '#F08080',
  },

  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ThemeColors = typeof lightColors;
