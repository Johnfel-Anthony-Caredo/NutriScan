import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading: authLoading } = useAuth();
  const { profile, isHydrated: profileHydrated } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !profileHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const isSplash = segments.length === 0 || (segments.length === 1 && segments[0] === 'index');

    if (!session && !inAuthGroup && !isSplash) {
      // Redirect to login if unauthenticated and not on splash or auth pages
      router.replace('/(auth)/login');
    } else if (session) {
      if (!profile.onboardingCompleted && !inOnboardingGroup && !isSplash) {
        // Redirect to onboarding if not completed
        router.replace('/(onboarding)/welcome');
      } else if (profile.onboardingCompleted && inAuthGroup) {
        // Logged in, onboarding done, trying to access auth screens -> go to tabs
        router.replace('/(tabs)');
      } else if (!profile.onboardingCompleted && inAuthGroup) {
        // Logged in, onboarding NOT done, trying to access auth screens -> go to onboarding
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [session, authLoading, profile.onboardingCompleted, profileHydrated, segments, router]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
        <Stack.Screen name="nutribot" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="article/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
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
