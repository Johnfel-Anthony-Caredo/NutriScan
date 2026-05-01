/**
 * NutriScan Shadow Tokens
 *
 * Platform-aware: uses `elevation` on Android and
 * `shadow*` properties on iOS.
 */

import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

const createShadow = (
  offsetY: number,
  blurRadius: number,
  opacity: number,
  elevation: number,
  color = '#1A1918',
): ShadowStyle => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
  };
};

export const shadows = {
  /** Subtle — cards on surface */
  sm: createShadow(1, 3, 0.06, 1),
  /** Medium — elevated cards, dropdowns */
  md: createShadow(2, 8, 0.1, 3),
  /** Large — modals, floating buttons */
  lg: createShadow(4, 16, 0.14, 6),
} as const;
