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

import { useAuth } from '@/context/AuthContext';
import {
    getUserProfile,
    updateUserProfile,
    upsertNutrientTargets,
    upsertUserConditions,
} from '@/services/supabaseService';
import {
    DEFAULT_PROFILE,
    buildNutrientTargets,
    nutrientLabels,
    type HealthCondition,
    type HealthGoal,
    type MonitoredNutrient,
    type UserHealthProfile
} from '@/types/health';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from 'react';

// ── State ──────────────────────────────────────────────────────────

interface ProfileState {
  profile: UserHealthProfile;
  isLoading: boolean;
  isHydrated: boolean;
  hydrationError: string | null;
}

const initialState: ProfileState = {
  profile: DEFAULT_PROFILE,
  isLoading: true,
  isHydrated: false,
  hydrationError: null,
};

// ── Actions ────────────────────────────────────────────────────────

type ProfileAction =
  | { type: 'HYDRATE_START' }
  | { type: 'HYDRATE'; payload: UserHealthProfile }
  | { type: 'HYDRATION_ERROR'; payload: string }
  | { type: 'SET_CONDITIONS'; payload: HealthCondition[] }
  | { type: 'SET_PRIMARY_CONDITION'; payload: { condition: HealthCondition; source: 'listed' | 'other' | 'unsure_ai'; customCondition?: string; aiSuggestedCondition?: HealthCondition } }
  | { type: 'SET_GOALS'; payload: HealthGoal[] }
  | { type: 'SET_NUTRIBOT_NOTE'; payload: string }
  | { type: 'SET_AI_SUGGESTED_CONDITION'; payload: HealthCondition }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserHealthProfile> }
  | { type: 'RESET' };

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'HYDRATE_START':
      return { ...state, isLoading: true, hydrationError: null };
    case 'HYDRATE':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        isHydrated: true,
        hydrationError: null,
      };
    case 'HYDRATION_ERROR':
      return {
        ...state,
        profile: DEFAULT_PROFILE,
        isLoading: false,
        isHydrated: true,
        hydrationError: action.payload,
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
    case 'SET_PRIMARY_CONDITION': {
      const conditions = [action.payload.condition];
      const nutrientTargets = buildNutrientTargets(conditions);
      return {
        ...state,
        profile: {
          ...state.profile,
          conditions,
          nutrientTargets,
          customCondition: action.payload.customCondition,
          conditionSource: action.payload.source,
          aiSuggestedCondition: action.payload.aiSuggestedCondition,
        },
      };
    }
    case 'SET_AI_SUGGESTED_CONDITION': {
      return {
        ...state,
        profile: {
          ...state.profile,
          aiSuggestedCondition: action.payload,
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
  hydrationError: string | null;
  setConditions: (conditions: HealthCondition[]) => void;
  setPrimaryCondition: (params: { condition: HealthCondition; source: 'listed' | 'other' | 'unsure_ai'; customCondition?: string; aiSuggestedCondition?: HealthCondition }) => void;
  setAiSuggestedCondition: (condition: HealthCondition) => void;
  setGoals: (goals: HealthGoal[]) => void;
  setNutriBotNote: (note: string) => void;
  completeOnboarding: () => Promise<void>;
  updateProfile: (partial: Partial<UserHealthProfile>) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = '@nutriscan/profile';

function mapSupabaseProfile(data: any): UserHealthProfile {
  const conditions = (data?.user_conditions ?? [])
    .map((row: { condition: HealthCondition }) => row.condition)
    .filter(Boolean);

  const nutrientTargets = (data?.user_nutrient_targets ?? [])
    .map((row: { nutrient: MonitoredNutrient; daily_limit: number; unit: string }) => ({
      nutrient: row.nutrient,
      label: nutrientLabels[row.nutrient] ?? row.nutrient,
      dailyLimit: row.daily_limit,
      unit: row.unit,
    }));

  return {
    conditions,
    goals: data?.goals ?? [],
    nutrientTargets,
    nutriBotNote: data?.nutribot_note ?? undefined,
    onboardingCompleted: Boolean(data?.onboarding_completed),
    customCondition: data?.custom_condition ?? undefined,
    conditionSource: data?.condition_source ?? undefined,
    aiSuggestedCondition: data?.ai_suggested_condition ?? undefined,
    name: data?.name ?? undefined,
    age: data?.age ?? undefined,
    heightCm: data?.height_cm ?? undefined,
    weightKg: data?.weight_kg ?? undefined,
    bloodType: data?.blood_type ?? undefined,
  };
}

// ── Provider ───────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { user } = useAuth();

  const hydrateFromStorage = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as UserHealthProfile;
      }
    } catch {
      return DEFAULT_PROFILE;
    }

    return DEFAULT_PROFILE;
  }, []);

  useEffect(() => {
    let isActive = true;

    const hydrate = async () => {
      dispatch({ type: 'HYDRATE_START' });

      if (user) {
        try {
          const remote = await getUserProfile(user.id);
          if (isActive) {
            dispatch({ type: 'HYDRATE', payload: mapSupabaseProfile(remote) });
          }
          return;
        } catch (error) {
          console.warn('Supabase profile hydrate failed, falling back to storage:', error);
        }
      }

      const localProfile = await hydrateFromStorage();
      if (!isActive) return;

      // If local profile is DEFAULT_PROFILE (never onboarded, no local data) and Supabase failed,
      // that's expected for new users. Only flag an error if Supabase failed AND local is empty.
      if (user && localProfile === DEFAULT_PROFILE) {
        // Supabase had a user but profile fetch failed — this is a real error
        dispatch({ type: 'HYDRATION_ERROR', payload: 'Could not load your profile. Using defaults.' });
      } else {
        dispatch({ type: 'HYDRATE', payload: localProfile });
      }
    };

    hydrate();

    return () => {
      isActive = false;
    };
  }, [hydrateFromStorage, user]);

  // Persist to storage on every profile change after hydration
  useEffect(() => {
    if (state.isHydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile)).catch(() => {});
    }
  }, [state.profile, state.isHydrated]);

  const setPrimaryCondition = useCallback((params: { condition: HealthCondition; source: 'listed' | 'other' | 'unsure_ai'; customCondition?: string; aiSuggestedCondition?: HealthCondition }) => {
    dispatch({ type: 'SET_PRIMARY_CONDITION', payload: params });

    if (user) {
      const conditions = [params.condition];
      const nutrientTargets = buildNutrientTargets(conditions);
      upsertUserConditions(user.id, conditions).catch((error) => {
        console.warn('Supabase conditions sync failed:', error);
      });
      upsertNutrientTargets(user.id, nutrientTargets).catch((error) => {
        console.warn('Supabase nutrient targets sync failed:', error);
      });
      updateUserProfile(user.id, {
        custom_condition: params.customCondition,
        condition_source: params.source,
        ai_suggested_condition: params.aiSuggestedCondition,
      }).catch((error) => {
        console.warn('Supabase profile sync failed:', error);
      });
    }
  }, [user]);

  const setAiSuggestedCondition = useCallback((condition: HealthCondition) => {
    dispatch({ type: 'SET_AI_SUGGESTED_CONDITION', payload: condition });
  }, []);

  const setConditions = useCallback((conditions: HealthCondition[]) => {
    const nutrientTargets = buildNutrientTargets(conditions);
    dispatch({ type: 'SET_CONDITIONS', payload: conditions });

    if (user) {
      upsertUserConditions(user.id, conditions).catch((error) => {
        console.warn('Supabase conditions sync failed:', error);
      });
      upsertNutrientTargets(user.id, nutrientTargets).catch((error) => {
        console.warn('Supabase nutrient targets sync failed:', error);
      });
    }
  }, [user]);

  const setGoals = useCallback((goals: HealthGoal[]) => {
    dispatch({ type: 'SET_GOALS', payload: goals });

    if (user) {
      updateUserProfile(user.id, { goals }).catch((error) => {
        console.warn('Supabase goals sync failed:', error);
      });
    }
  }, [user]);

  const setNutriBotNote = useCallback((note: string) => {
    dispatch({ type: 'SET_NUTRIBOT_NOTE', payload: note });

    if (user) {
      updateUserProfile(user.id, { nutribot_note: note }).catch((error) => {
        console.warn('Supabase NutriBot note sync failed:', error);
      });
    }
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });

    if (user) {
      try {
        await upsertUserConditions(user.id, state.profile.conditions);
        await upsertNutrientTargets(user.id, state.profile.nutrientTargets);
        await updateUserProfile(user.id, {
          goals: state.profile.goals,
          nutribot_note: state.profile.nutriBotNote,
          onboarding_completed: true,
          custom_condition: state.profile.customCondition,
          condition_source: state.profile.conditionSource,
          ai_suggested_condition: state.profile.aiSuggestedCondition,
        });
      } catch (error) {
        console.warn('Supabase onboarding sync failed, local state is saved:', error);
        // Don't block — local state + AsyncStorage is already persisted
      }
    }
  }, [state.profile, user]);

  const updateProfile = useCallback((partial: Partial<UserHealthProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: partial });

    if (!user) return;

    const updates: {
      name?: string;
      age?: number;
      height_cm?: number;
      weight_kg?: number;
      blood_type?: string;
      goals?: HealthGoal[];
      nutribot_note?: string;
      onboarding_completed?: boolean;
    } = {};

    if (partial.name !== undefined) updates.name = partial.name;
    if (partial.age !== undefined) updates.age = partial.age;
    if (partial.heightCm !== undefined) updates.height_cm = partial.heightCm;
    if (partial.weightKg !== undefined) updates.weight_kg = partial.weightKg;
    if (partial.bloodType !== undefined) updates.blood_type = partial.bloodType;
    if (partial.goals) updates.goals = partial.goals;
    if (partial.nutriBotNote !== undefined) updates.nutribot_note = partial.nutriBotNote;
    if (partial.onboardingCompleted !== undefined) updates.onboarding_completed = partial.onboardingCompleted;

    if (Object.keys(updates).length > 0) {
      updateUserProfile(user.id, updates).catch((error) => {
        console.warn('Supabase profile sync failed:', error);
      });
    }

    if (partial.conditions) {
      const nutrientTargets = partial.nutrientTargets ?? buildNutrientTargets(partial.conditions);
      upsertUserConditions(user.id, partial.conditions).catch((error) => {
        console.warn('Supabase conditions sync failed:', error);
      });
      upsertNutrientTargets(user.id, nutrientTargets).catch((error) => {
        console.warn('Supabase nutrient targets sync failed:', error);
      });
    } else if (partial.nutrientTargets) {
      upsertNutrientTargets(user.id, partial.nutrientTargets).catch((error) => {
        console.warn('Supabase nutrient targets sync failed:', error);
      });
    }
  }, [user]);

  const resetProfile = useCallback(async () => {
    dispatch({ type: 'RESET' });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors during reset
    }
    // NOTE: This only clears local state + AsyncStorage.
    // Remote Supabase data is preserved so it can be restored on re-login.
    // The "Reset Profile & Restart Onboarding" action clears remote data separately.
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile: state.profile,
        isLoading: state.isLoading,
        isHydrated: state.isHydrated,
        hydrationError: state.hydrationError,
        setConditions,
        setPrimaryCondition,
        setAiSuggestedCondition,
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
