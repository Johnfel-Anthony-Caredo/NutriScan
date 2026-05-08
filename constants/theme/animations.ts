/**
 * NutriScan Neo-Brutalist Animation Presets
 *
 * Snappy, physical motion — no slow or floaty animations.
 */

export const animations = {
  /** Bounce curve for press interactions */
  bounce: {
    tension: 120,
    friction: 8,
  },
  /** Quick fade-in */
  snap: {
    duration: 180,
  },
  /** Spring scale down on press */
  pressScale: {
    toValue: 0.96,
    tension: 150,
    friction: 6,
    useNativeDriver: true,
  },
  /** Spring scale up on release */
  releaseScale: {
    toValue: 1,
    tension: 100,
    friction: 7,
    useNativeDriver: true,
  },
} as const;
