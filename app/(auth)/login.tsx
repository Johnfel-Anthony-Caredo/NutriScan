/**
 * Login Screen — full authentication entry point.
 *
 * Features:
 * - Email/password fields with validation feedback
 * - Primary Sign In button
 * - Google + Apple social login buttons
 * - Forgot password link
 * - Create account link
 * - Medical disclaimer footer
 */

import { AppScreen, PrimaryButton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signIn } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  const handleSocial = (provider: string) => {
    Alert.alert(`${provider} Sign In`, `${provider} authentication will be integrated in a future update.`);
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
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
            <Ionicons name="leaf" size={48} color={theme.colors.primary} />
          </View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: theme.fontWeights.bold,
              marginTop: 16,
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
              <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>{errors.email}</Text>
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityRole="button">
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>{errors.password}</Text>
            )}
          </View>

          {/* Forgot password */}
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotLink} accessibilityRole="link">
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {authError ? (
            <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>
              {authError}
            </Text>
          ) : null}

          {/* Sign In button */}
          <PrimaryButton label="Sign In" onPress={handleSignIn} style={{ marginTop: 8 }} loading={isSubmitting} />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginHorizontal: 12 }}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Social Login */}
          <View style={styles.socialRow}>
            <View style={styles.socialShadowWrap}>
              {Platform.OS === 'android' && (
                <View style={[styles.socialShadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.md }]} pointerEvents="none" />
              )}
              <TouchableOpacity
                onPress={() => handleSocial('Google')}
                style={[styles.socialBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>
                  Google
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialShadowWrap}>
              {Platform.OS === 'android' && (
                <View style={[styles.socialShadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.md }]} pointerEvents="none" />
              )}
              <TouchableOpacity
                onPress={() => handleSocial('Apple')}
                style={[styles.socialBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Apple"
              >
                <Ionicons name="logo-apple" size={20} color={theme.colors.textPrimary} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>
                  Apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
  logoCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  form: {},
  fieldWrap: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 2 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialShadowWrap: { flex: 1, position: 'relative' },
  socialShadowBlock: { position: 'absolute', top: 5, left: 5, right: 0, bottom: 0 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 3 },
  createRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});