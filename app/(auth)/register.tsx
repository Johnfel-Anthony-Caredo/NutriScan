/**
 * Register Screen — polished placeholder for Phase 1.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, PrimaryButton } from '@/components/ui';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();

  const inputStyle = {
    backgroundColor: theme.colors.surfaceSecondary,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  };

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Create Account" showBack />
      <View style={[styles.content, { paddingHorizontal: 20 }]}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.bold,
            marginBottom: 8,
          }}
        >
          Join NutriScan
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.body,
            lineHeight: theme.lineHeights.body,
            marginBottom: 32,
          }}
        >
          Create your account to start scanning food and getting personalized health guidance.
        </Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor={theme.colors.textTertiary}
          style={inputStyle}
          accessibilityLabel="Full name input"
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.colors.textTertiary}
          style={inputStyle}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email input"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.colors.textTertiary}
          style={inputStyle}
          secureTextEntry
          accessibilityLabel="Password input"
        />

        <PrimaryButton
          label="Create Account"
          onPress={() => router.replace('/(onboarding)/welcome')}
          style={{ marginTop: 8 }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 24,
  },
});
