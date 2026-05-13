/**
 * Landing Screen — welcoming first-open screen before auth.
 *
 * Layout (matches design reference):
 *   - Full-screen hero image bleeding edge-to-edge
 *   - Gradient fade from image into clean white content area
 *   - Logo icon top-left inside hero
 *   - Bold headline with green accent word in white content area
 *   - Subtitle paragraph
 *   - Gradient pill "Create an account" CTA
 *   - Plain "Already have an account?" secondary link
 *
 * Authenticated users are redirected by _layout.tsx route guard.
 */

import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.58;

export default function LandingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Entrance animations
  const heroScale = useRef(new Animated.Value(1.06)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(24)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero zoom-out
    Animated.timing(heroScale, {
      toValue: 1,
      duration: 1100,
      useNativeDriver: true,
    }).start();

    // Logo fades in quickly
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Content slides up
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Full-bleed Hero Image ─────────────────────── */}
      <Animated.View style={[styles.heroWrap, { transform: [{ scale: heroScale }] }]}>
        <Image
          source={require('../assets/images/Salad.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ── Logo top-left overlaid on hero ───────────── */}
      <Animated.View
        style={[
          styles.logoWrap,
          { top: insets.top + 16, opacity: logoOpacity },
        ]}
      >
        <View style={styles.logoBubble}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* ── Gradient fade hero → white ───────────────── */}
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.72)', '#ffffff']}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* ── Bottom content area ───────────────────────── */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            paddingBottom: Math.max(insets.bottom, 20) + 8,
          },
        ]}
      >
        {/* Headline */}
        <Text style={[styles.headlineBlack, { fontFamily: theme.fontFamilies.heading }]}>
          Scan your food.
        </Text>
        <View style={styles.headlineAccentRow}>
          <Text style={[styles.headlineAccent, { fontFamily: theme.fontFamilies.heading, color: theme.colors.primary }]}>
            Protect{' '}
          </Text>
          <Text style={[styles.headlineBlack, { fontFamily: theme.fontFamilies.heading }]}>
            your health.
          </Text>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fontFamilies.body }]}>
          Point your camera at any food, scan a barcode, or search manually — get an instant Safe, Caution, or Avoid verdict tailored to your health profile.
        </Text>

        {/* Primary CTA — gradient pill */}
        <GradientCTA
          label="Create an account"
          onPress={() => router.push('/(auth)/register')}
          primaryColor={theme.colors.primary}
        />

        {/* Secondary — plain text link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginRow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Already have an account? Sign in"
        >
          <Text style={[styles.loginText, { color: theme.colors.textSecondary, fontFamily: theme.fontFamilies.body }]}>
            Already have an account?
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Gradient CTA Button ─────────────────────────────────────────────────────
function GradientCTA({
  label,
  onPress,
  primaryColor,
}: {
  label: string;
  onPress: () => void;
  primaryColor: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, tension: 150, friction: 6, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, tension: 100, friction: 7, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.ctaWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.ctaTouchable}
      >
        <LinearGradient
          colors={[primaryColor, '#0d2b0d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // ── Hero
  heroWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },

  // ── Logo
  logoWrap: {
    position: 'absolute',
    left: 20,
  },
  logoBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 30,
    height: 30,
  },

  // ── Gradient overlay
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: HERO_HEIGHT - 180,
    height: 240,
  },

  // ── Content
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  headlineBlack: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f1a0f',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  headlineAccentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  headlineAccent: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.8,
  },

  // ── CTA
  ctaWrap: {
    marginBottom: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaTouchable: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaGradient: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: 'Space Grotesk',
  },

  // ── Login row
  loginRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loginText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
