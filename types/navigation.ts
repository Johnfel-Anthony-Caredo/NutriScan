/**
 * NutriScan Navigation Types
 *
 * Since we use Expo Router (file-based routing), most type safety
 * comes from `typedRoutes: true`. These types supplement with
 * domain-level param shapes.
 */

export type RootStackParamList = {
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'nutribot': undefined;
  'article/[id]': { id: string };
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

export type OnboardingStackParamList = {
  welcome: undefined;
  conditions: undefined;
};

export type MainTabParamList = {
  index: undefined;   // Home
  scan: undefined;
  history: undefined;
  profile: undefined;
};
