/**
 * Splash Screen — app entry point.
 *
 * Animated NutriScan logo fade-in, followed by tagline fade-in 300ms later.
 * After 2 seconds, auto-navigates based on profile state:
 *   - First launch (no onboarding) → Auth login screen
 *   - Onboarding not completed → Onboarding welcome
 *   - Returning user → Main tabs
 *
 * No buttons, no input — purely animated and auto-advancing.
 * Uses theme tokens for all colors and typography.
 */

import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, isLoading: profileLoading, isHydrated } = useProfile();
  const { session, isLoading: authLoading } = useAuth();

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;

  // Start animations on mount
  useEffect(() => {
    // Logo: fade in + scale up
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline: fade in 300ms after logo
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  // Navigate after animation once auth state is resolved
  useEffect(() => {
    if (authLoading || !isHydrated) return;

    const navigate = () => {
      if (!session) {
        router.replace('/(auth)/login');
        return;
      }

      if (!profile.onboardingCompleted) {
        router.replace('/(onboarding)/welcome');
        return;
      }

      router.replace('/(tabs)');
    };

    // Wait for splash animation on initial load, navigate immediately otherwise
    const timer = setTimeout(navigate, 2000);

    return () => clearTimeout(timer);
  }, [authLoading, isHydrated, session, profile.onboardingCompleted, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border, borderWidth: 3 }]}>
          <Ionicons name="leaf" size={56} color={theme.colors.primary} />
        </View>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes['3xl'],
            fontFamily: theme.textStyles.displayMd.fontFamily,
            fontWeight: theme.fontWeights.bold,
            marginTop: 20,
            letterSpacing: 0.5,
          }}
        >
          NutriScan
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineTranslateY }],
          marginTop: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.lg,
            fontFamily: theme.textStyles.body.fontFamily,
            lineHeight: theme.lineHeights.lg,
            textAlign: 'center',
          }}
        >
          Scan your food.{'\n'}Protect your health.
        </Text>
      </Animated.View>

      {/* Subtle loading indicator */}
      {(profileLoading || authLoading) && (
        <View style={styles.loadingDots}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary, opacity: 0.3 }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary, opacity: 0.6 }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary, opacity: 1 }]} />
        </View>
      )}

      {/* Version */}
      <Text
        style={{
          color: theme.colors.textTertiary,
          fontSize: theme.fontSizes.xs,
          position: 'absolute',
          bottom: 40,
        }}
      >
        v1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
