/**
 * Login Screen — polished placeholder for Phase 1.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, PrimaryButton, SecondaryButton } from '@/components/ui';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.container}>
        {/* ── Branding ──────────────────── */}
        <View style={styles.branding}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Ionicons name="leaf" size={48} color={theme.colors.primary} />
          </View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: theme.fontWeights.bold,
              marginTop: 20,
            }}
          >
            NutriScan
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.lg,
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Scan your food.{'\n'}Protect your health.
          </Text>
        </View>

        {/* ── Actions ───────────────────── */}
        <View style={styles.actions}>
          <PrimaryButton
            label="Sign In"
            onPress={() => router.replace('/(tabs)')}
          />
          <SecondaryButton
            label="Create Account"
            onPress={() => router.push('/(auth)/register')}
            style={{ marginTop: 12 }}
          />
          <Text
            style={{
              color: theme.colors.textTertiary,
              fontSize: theme.fontSizes.sm,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  branding: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    marginTop: 40,
  },
});
