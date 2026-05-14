/**
 * Landing Screen — welcoming first-open screen before auth.
 *
 * Layout:
 *   - Hero image fills the ENTIRE screen (absolute, full height)
 *   - One long LinearGradient overlays: transparent → #fff
 *     Starting at 32% of screen height, ending at bottom
 *     This eliminates any visible seam — the image bleeds right into white
 *   - Logo bubble top-left over the hero
 *   - Content (headline, subtitle, CTAs) pinned to the bottom
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

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

// The gradient starts this far from the top — deep enough into the image
// to avoid any visible boundary between image and white
const GRADIENT_START_Y = SCREEN_H * 0.32;

export default function LandingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const heroScale   = useRef(new Animated.Value(1.06)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero subtle zoom-out on mount
    Animated.timing(heroScale, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Logo fades in
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    // Content slides up from below
    setTimeout(() => {
      Animated.spring(contentAnim, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }).start();
    }, 250);
  }, []);

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0],
  });

  return (
    <View style={styles.root}>

      {/* ── Hero: fills the entire screen ─────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: heroScale }] }]}>
        <Image
          source={require('../assets/images/Salad.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ── Gradient: transparent → white, tall single pass ───────────── */}
      {/* Starts well inside the image, fades to pure #fff at bottom.     */}
      {/* No mid-stop with opacity — pure two-stop so there's no band.    */}
      <LinearGradient
        colors={['transparent', '#ffffff']}
        locations={[0, 1]}
        style={[styles.gradient, { top: GRADIENT_START_Y }]}
        pointerEvents="none"
      />

      {/* White floor below the gradient — ensures bottom is truly opaque */}
      <View style={[styles.whiteFloor, { bottom: 0 }]} pointerEvents="none" />

      {/* ── Logo bubble, top-left ──────────────────────────────────────── */}
      <Animated.View style={[styles.logoWrap, { top: insets.top + 16, opacity: logoOpacity }]}>
        <View style={styles.logoBubble}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* ── Content: headline, subtitle, CTAs ────────────────────────── */}
      <Animated.View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 24) + 4,
            opacity: contentAnim,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        {/* Headline */}
        <Text style={[styles.headlineBlack, { fontFamily: theme.fontFamilies.heading }]}>
          Scan your food.
        </Text>
        <View style={styles.headlineRow}>
          <Text style={[styles.headlineAccent, { fontFamily: theme.fontFamilies.heading, color: theme.colors.primary }]}>
            Protect{' '}
          </Text>
          <Text style={[styles.headlineBlack, { fontFamily: theme.fontFamilies.heading }]}>
            your health.
          </Text>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fontFamilies.body }]}>
          Point your camera at any food, scan a barcode, or search manually — get an instant verdict tailored to your health profile.
        </Text>

        {/* Primary CTA */}
        <GradientCTA
          label="Create an account"
          onPress={() => router.push('/(auth)/register')}
          primaryColor={theme.colors.primary}
        />

        {/* Secondary */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginRow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Already have an account?"
        >
          <Text style={[styles.loginText, { color: theme.colors.textSecondary, fontFamily: theme.fontFamilies.body }]}>
            Already have an account?
          </Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

// ─── Gradient CTA ─────────────────────────────────────────────────────────────
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

  const pressIn  = () => Animated.spring(scale, { toValue: 0.96, tension: 160, friction: 6, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    tension: 110, friction: 7, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 4 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.ctaTouchable}
      >
        <LinearGradient
          colors={[primaryColor, '#0a2010']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaGradient}
        >
          <Text style={[styles.ctaLabel, { fontFamily: 'Space Grotesk' }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  heroImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },

  // Gradient runs from GRADIENT_START_Y all the way to the bottom of the screen.
  // Height = SCREEN_H - GRADIENT_START_Y ensures full coverage with no seam.
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_H - GRADIENT_START_Y,
  },

  // Solid white block that fills the bottom few pixels in case
  // of any sub-pixel rounding gaps on the gradient edge.
  whiteFloor: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ffffff',
  },

  // Logo
  logoWrap: {
    position: 'absolute',
    left: 20,
  },
  logoBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 30,
    height: 30,
  },

  // Content area
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  headlineBlack: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f1a0f',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: 14,
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
    marginBottom: 28,
  },

  // CTA
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
  },

  // Secondary link
  loginRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
