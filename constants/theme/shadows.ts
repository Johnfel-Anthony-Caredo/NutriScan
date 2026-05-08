/**
 * NutriScan Neo-Brutalist Shadows
 *
 * Hard offset shadows — 0 blur, deep black color.
 * iOS: shadowRadius: 0 produces a crisp hard shadow.
 * Android: elevation provides subtle depth (platform limitation).
 * For a true hard shadow on Android, the Card component uses a View-based approach.
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

const createBrutalShadow = (
  offset: number,
  elevation: number,
): ShadowStyle => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
  };
};

export const shadows = {
  /** 3px offset — small cards, pills */
  sm: createBrutalShadow(3, 4),
  /** 5px offset — standard cards, buttons */
  md: createBrutalShadow(5, 6),
  /** 8px offset — modals, floating elements */
  lg: createBrutalShadow(8, 10),
} as const;
