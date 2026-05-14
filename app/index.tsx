/**
 * Landing Screen — welcoming first-open screen before auth.
 *
 * Layout:
 *   - Hero image fills the top portion (55% screen), clipped with rounded bottom
 *   - LinearGradient overlaid on the BOTTOM of the hero image only
 *     (transparent → #fff) so the image melts into the white content area
 *   - Content area is 100% solid white — no transparency, fully readable
 *   - Logo bubble overlaid top-left on the hero
 *   - Bold headline + subtitle + gradient CTA + secondary link
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
const HERO_HEIGHT = SCREEN_H * 0.52;

export default function LandingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const heroScale   = useRef(new Animated.Value(1.07)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroScale, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.spring(contentAnim, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }).start();
    }, 200);
  }, []);

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Hero block (clipped, image + gradient overlay) ────────── */}
      <View style={styles.heroBlock}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: heroScale }] }]}>
          <Image
            source={require('../assets/images/Salad.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Gradient melts the bottom of the hero INTO the white content below */}
        <LinearGradient
          colors={['transparent', '#ffffff']}
          locations={[0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />


      </View>

      {/* ── Content — solid white, always 100% readable ───────────── */}
      <Animated.View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 24) + 8,
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

        {/* Secondary link */}
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
    <Animated.View style={{ transform: [{ scale }], marginBottom: 6 }}>
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
          <Text style={styles.ctaLabel}>{label}</Text>
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

  // Hero block — fixed height, clips the image + bottom gradient
  heroBlock: {
    width: SCREEN_W,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#e8f5e9',
  },
  heroImage: {
    width: SCREEN_W,
    height: HERO_HEIGHT,
  },

  // Logo
  logoWrap: {
    position: 'absolute',
    top: 16,
    left: 20,
  },
  logoBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 30,
    height: 30,
  },

  // Content — solid white, stacks below hero naturally
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 28,
    paddingTop: 6,
    justifyContent: 'flex-end',
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
