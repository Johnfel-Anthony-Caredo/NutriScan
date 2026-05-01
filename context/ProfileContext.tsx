/**
 * ProfileContext — global profile state for NutriScan.
 *
 * Stores the user's health profile (conditions, goals, nutrient targets)
 * so every screen can access personalization data. Uses AsyncStorage
 * for persistence across app restarts.
 *
 * Architecture: React Context + useReducer for predictable state updates.
 * Simpler than Redux for this scope, and avoids extra dependencies.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type UserHealthProfile,
  type HealthCondition,
  type HealthGoal,
  type NutrientTarget,
  DEFAULT_PROFILE,
  buildNutrientTargets,
} from '@/types/health';

// ── State ──────────────────────────────────────────────────────────

interface ProfileState {
  profile: UserHealthProfile;
  isLoading: boolean;
  isHydrated: boolean;
}

const initialState: ProfileState = {
  profile: DEFAULT_PROFILE,
  isLoading: true,
  isHydrated: false,
};

// ── Actions ────────────────────────────────────────────────────────

type ProfileAction =
  | { type: 'HYDRATE'; payload: UserHealthProfile }
  | { type: 'SET_CONDITIONS'; payload: HealthCondition[] }
  | { type: 'SET_GOALS'; payload: HealthGoal[] }
  | { type: 'SET_NUTRIBOT_NOTE'; payload: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserHealthProfile> }
  | { type: 'RESET' };

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        isHydrated: true,
      };
    case 'SET_CONDITIONS': {
      const nutrientTargets = buildNutrientTargets(action.payload);
      return {
        ...state,
        profile: {
          ...state.profile,
          conditions: action.payload,
          nutrientTargets,
        },
      };
    }
    case 'SET_GOALS':
      return {
        ...state,
        profile: { ...state.profile, goals: action.payload },
      };
    case 'SET_NUTRIBOT_NOTE':
      return {
        ...state,
        profile: { ...state.profile, nutriBotNote: action.payload },
      };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        profile: { ...state.profile, onboardingCompleted: true },
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };
    case 'RESET':
      return { ...state, profile: DEFAULT_PROFILE };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────

interface ProfileContextValue {
  profile: UserHealthProfile;
  isLoading: boolean;
  isHydrated: boolean;
  setConditions: (conditions: HealthCondition[]) => void;
  setGoals: (goals: HealthGoal[]) => void;
  setNutriBotNote: (note: string) => void;
  completeOnboarding: () => void;
  updateProfile: (partial: Partial<UserHealthProfile>) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = '@nutriscan/profile';

// ── Provider ───────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Hydrate from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as UserHealthProfile;
          dispatch({ type: 'HYDRATE', payload: parsed });
        } else {
          dispatch({ type: 'HYDRATE', payload: DEFAULT_PROFILE });
        }
      } catch {
        dispatch({ type: 'HYDRATE', payload: DEFAULT_PROFILE });
      }
    })();
  }, []);

  // Persist to storage on every profile change after hydration
  useEffect(() => {
    if (state.isHydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile)).catch(() => {});
    }
  }, [state.profile, state.isHydrated]);

  const setConditions = useCallback((conditions: HealthCondition[]) => {
    dispatch({ type: 'SET_CONDITIONS', payload: conditions });
  }, []);

  const setGoals = useCallback((goals: HealthGoal[]) => {
    dispatch({ type: 'SET_GOALS', payload: goals });
  }, []);

  const setNutriBotNote = useCallback((note: string) => {
    dispatch({ type: 'SET_NUTRIBOT_NOTE', payload: note });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  const updateProfile = useCallback((partial: Partial<UserHealthProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: partial });
  }, []);

  const resetProfile = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile: state.profile,
        isLoading: state.isLoading,
        isHydrated: state.isHydrated,
        setConditions,
        setGoals,
        setNutriBotNote,
        completeOnboarding,
        updateProfile,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}
