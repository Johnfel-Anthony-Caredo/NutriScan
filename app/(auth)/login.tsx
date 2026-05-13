/**
 * Login Screen — email/password authentication.
 *
 * Features:
 * - Logo image branding header
 * - Email/password fields with validation feedback
 * - Forgot password link
 * - Primary Sign In button
 * - Create account link
 * - Footer disclaimer
 */

import { AppScreen, PrimaryButton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signIn } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password.trim()) newErrors.password = 'Please enter your password';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      await signIn(email.trim(), password);
      // Let the global route guard in _layout.tsx handle the redirect.
      // Reset submitting state in case the redirect is delayed.
      setIsSubmitting(false);
    } catch {
      setAuthError('Invalid email or password');
      setIsSubmitting(false); // Only reset if there's an error
    }
  };

  const inputStyle = (hasError: boolean) => ({
    backgroundColor: theme.colors.surfaceSecondary,
    borderColor: hasError ? theme.colors.avoid.icon : theme.colors.border,
    borderWidth: 3,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fontFamilies.body,
    color: theme.colors.textPrimary,
  });

  return (
    <AppScreen scroll>
      <View style={styles.container}>
        {/* ── Branding ────────────────────── */}
        <View style={styles.branding}>
          <Image
            source={require('../../assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: theme.fontWeights.bold,
              marginTop: 14,
              fontFamily: theme.fontFamilies.heading,
            }}
          >
            NutriScan
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.body,
              marginTop: 4,
              textAlign: 'center',
              fontFamily: theme.fontFamilies.body,
            }}
          >
            Scan your food. Protect your health.
          </Text>
        </View>

        {/* ── Form ────────────────────────── */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, fontFamily: theme.fontFamilies.body }}>
              Email
            </Text>
            <View style={[styles.inputRow, inputStyle(!!errors.email)]}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                placeholder="your@email.com"
                placeholderTextColor={theme.colors.textTertiary}
                style={{ flex: 1, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, color: theme.colors.textPrimary }}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email input"
              />
            </View>
            {errors.email && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} />
                <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>{errors.email}</Text>
              </View>
            )}
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, fontFamily: theme.fontFamilies.body }}>
              Password
            </Text>
            <View style={[styles.inputRow, inputStyle(!!errors.password)]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textTertiary}
                style={{ flex: 1, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, color: theme.colors.textPrimary }}
                secureTextEntry={!showPassword}
                accessibilityLabel="Password input"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityRole="button" hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} />
                <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>{errors.password}</Text>
              </View>
            )}
          </View>

          {/* Forgot password */}
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotLink} accessibilityRole="link">
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Auth error banner */}
          {authError ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.avoid.bg, borderColor: theme.colors.avoid.border }]}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.avoid.icon} />
              <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, flex: 1 }}>
                {authError}
              </Text>
            </View>
          ) : null}

          {/* Sign In button */}
          <PrimaryButton label="Sign In" onPress={handleSignIn} style={{ marginTop: 8 }} loading={isSubmitting} />

          {/* Create Account */}
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.createRow} accessibilityRole="link">
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body }}>
              {"Don't have an account? "}
            </Text>
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ──────────────────────── */}
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.xs,
            textAlign: 'center',
            marginTop: 24,
            lineHeight: theme.lineHeights.xs,
            fontFamily: theme.fontFamilies.body,
          }}
        >
          By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingBottom: 20 },
  branding: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 96, height: 96 },
  form: {},
  fieldWrap: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 8 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 3, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  createRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});