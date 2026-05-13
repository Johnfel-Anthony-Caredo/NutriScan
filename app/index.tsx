/**
 * Landing Screen — welcoming first-open screen before auth.
 *
 * Layout:
 *   - Full-bleed hero image (Salad.jpg) covering the top ~55%
 *   - Bold tagline overlaid on hero with text shadows
 *   - Clean white bottom sheet with logo, welcome text, and CTAs at bottom
 *
 * Authenticated users are redirected by _layout.tsx route guard.
 */

import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.52;

export default function LandingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Entrance animations
  const heroScale = useRef(new Animated.Value(1.08)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(16)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(heroScale, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 250);

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
    }, 350);
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Hero Image ─────────────────────────────── */}
      <Animated.View style={[styles.heroWrap, { transform: [{ scale: heroScale }] }]}>
        <Image
          source={require('../assets/images/Salad.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroFade} />

        {/* Tagline */}
        <Animated.View
          style={[
            styles.heroTaglineWrap,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          <Text style={[styles.heroTagline, { fontFamily: theme.fontFamilies.heading }]}>
            Eat smart.
          </Text>
          <Text style={[styles.heroTagline, { fontFamily: theme.fontFamilies.heading }]}>
            Live better.
          </Text>
        </Animated.View>
      </Animated.View>

      {/* ── Bottom Sheet ──────────────────────────────── */}
      <Animated.View
        style={[
          styles.contentCard,
          {
            backgroundColor: theme.colors.background,
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />

        {/* Logo + welcome */}
        <View style={styles.welcomeRow}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.logoSmall}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.welcomeText,
              { color: theme.colors.textPrimary, fontFamily: theme.fontFamilies.heading },
            ]}
          >
            Welcome to NutriScan
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Primary CTA */}
        <CTAButton
          label="Create an account"
          onPress={() => router.push('/(auth)/register')}
          primary
          theme={theme}
        />

        {/* Secondary */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginRow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Already have an account? Sign in"
        >
          <Text
            style={[
              styles.loginText,
              { color: theme.colors.textSecondary, fontFamily: theme.fontFamilies.body },
            ]}
          >
            Already have an account?{' '}
          </Text>
          <Text
            style={[
              styles.loginLink,
              { color: theme.colors.primary, fontFamily: theme.fontFamilies.heading },
            ]}
          >
            Sign in
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── CTA button ──────────────────────────────────────────────────────────────
function CTAButton({
  label,
  onPress,
  primary,
  theme,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  theme: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      tension: 150,
      friction: 6,
      useNativeDriver: true,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {Platform.OS === 'android' && primary && (
        <View
          style={[
            styles.shadowBlock,
            { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.full },
          ]}
          pointerEvents="none"
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.ctaBtn,
          {
            backgroundColor: primary ? theme.colors.primary : 'transparent',
            borderColor: primary ? theme.colors.border : theme.colors.border,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <Text
          style={[
            styles.ctaLabel,
            {
              color: primary ? theme.colors.textInverse : theme.colors.textPrimary,
              fontFamily: theme.fontFamilies.heading,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ── Hero
  heroWrap: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroTaglineWrap: {
    position: 'absolute',
    bottom: 32,
    left: 28,
    right: 28,
  },
  heroTagline: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 46,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  // ── Bottom sheet
  contentCard: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  // ── Welcome
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoSmall: {
    width: 44,
    height: 44,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // ── CTA
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  ctaBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Login row
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 4,
  },
  loginText: {
    fontSize: 15,
    lineHeight: 20,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
});
