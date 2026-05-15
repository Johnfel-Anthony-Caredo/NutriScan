import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import 'react-native-reanimated';

function RootLayoutNav() {
  const { session, isLoading: authLoading } = useAuth();
  const { profile, isHydrated: profileHydrated } = useProfile();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !profileHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    // Landing screen is the index route — allow unauthenticated users to stay here
    const isLanding = pathname === '/' || pathname === '/index';

    if (!session) {
      // Unauthenticated: redirect to login unless already on an auth or landing screen
      if (!inAuthGroup && !isLanding) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // ── Authenticated user ─────────────────────────────────────────────────
    if (!profile.onboardingCompleted) {
      // Onboarding not done: push to onboarding (unless already there)
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/welcome');
      }
    } else if (inAuthGroup || isLanding) {
      // Fully authenticated + onboarded: skip auth / landing → go to tabs
      router.replace('/(tabs)');
    }
  }, [session, authLoading, profile.onboardingCompleted, profileHydrated, segments, pathname, router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan-preview" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="scan-result" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="manual-search" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="chat-history" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="health-report" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="article/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false, animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <RootLayoutNav />
      </ProfileProvider>
    </AuthProvider>
  );
}
