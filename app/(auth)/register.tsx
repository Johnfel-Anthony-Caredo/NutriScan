/**
 * Register Screen — email/password sign-up form.
 *
 * Structure mirrors the Login screen for consistency:
 * - Logo image branding header (same as login)
 * - Name, email, password, confirm password fields
 * - Password strength indicator
 * - Primary "Create Account" button
 * - "Already have an account?" link
 * - Footer disclaimer
 */

import { AppScreen, PrimaryButton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signUp } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [errs, setErrs] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = (() => {
    if (!password) return { label: '', color: 'transparent', w: '0%' };
    if (password.length < 6) return { label: 'Weak', color: theme.colors.avoid.icon, w: '25%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Strong', color: theme.colors.safe.icon, w: '100%' };
    return { label: 'Fair', color: theme.colors.caution.icon, w: '50%' };
  })();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!email.trim()) e.email = 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Please create a password';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirmPw) e.confirmPw = 'Passwords do not match';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      const data = await signUp(name.trim(), email.trim(), password);
      if (!data.session) {
        setEmailSent(true);
        setIsSubmitting(false);
      }
      // If data.session exists, let the global route guard in _layout.tsx handle the redirect.
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Sign up failed. Please try again.';
      setAuthError(message);
      setIsSubmitting(false);
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

  // ── Email verification sent — confirmation view ──────────────────────
  if (emailSent) {
    return (
      <AppScreen scroll>
        <View style={styles.container}>
          {/* Same branding header */}
          <View style={styles.branding}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <View style={[styles.successCircle, { backgroundColor: theme.colors.safe.bg }]}>
              <Ionicons name="mail-open" size={48} color={theme.colors.safe.icon} />
            </View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 20, fontFamily: theme.fontFamilies.heading }}>
              Verify your email
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, maxWidth: 280, lineHeight: theme.lineHeights.body, fontFamily: theme.fontFamilies.body }}>
              We sent a confirmation link to{' '}
              <Text style={{ fontWeight: theme.fontWeights.semibold, color: theme.colors.textPrimary, fontFamily: theme.fontFamilies.body }}>{email}</Text>
              {'. '}Check your inbox and tap the link to activate your account.
            </Text>
            <PrimaryButton label="Go to Sign In" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28, width: '100%' }} />
          </View>
        </View>
      </AppScreen>
    );
  }

  // ── Main register form ───────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* ── Branding (matches Login) ──────── */}
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
              Create Account
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
              Join NutriScan for personalized food guidance.
            </Text>
          </View>

          {/* ── Form ─────────────────────────── */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldWrap}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, fontFamily: theme.fontFamilies.body }}>
                Full Name
              </Text>
              <View style={[styles.inputRow, inputStyle(!!errs.name)]}>
                <Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
                <TextInput
                  value={name}
                  onChangeText={(t) => { setName(t); if (errs.name) setErrs((e) => ({ ...e, name: undefined })); }}
                  placeholder="John Doe"
                  placeholderTextColor={theme.colors.textTertiary}
                  style={{ flex: 1, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, color: theme.colors.textPrimary }}
                  autoCapitalize="words"
                  accessibilityLabel="Full name input"
                />
                {name.trim() ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
              </View>
              {errs.name && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} />
                  <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>{errs.name}</Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, fontFamily: theme.fontFamilies.body }}>
                Email
              </Text>
              <View style={[styles.inputRow, inputStyle(!!errs.email)]}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (errs.email) setErrs((e) => ({ ...e, email: undefined })); }}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  style={{ flex: 1, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, color: theme.colors.textPrimary }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel="Email input"
                />
                {email.trim() ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
              </View>
              {errs.email && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} />
                  <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>{errs.email}</Text>
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, fontFamily: theme.fontFamilies.body }}>
                Password
              </Text>
              <View style={[styles.inputRow, inputStyle(!!errs.password)]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (errs.password) setErrs((e) => ({ ...e, password: undefined })); }}
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.textTertiary}
                  style={{ flex: 1, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, color: theme.colors.textPrimary }}
                  secureTextEntry={!showPw}
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} accessibilityRole="button" hitSlop={8}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {errs.password && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} />
                  <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>{errs.password}</Text>
                </View>
              )}
              {/* Password strength meter */}
              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthHeader}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body }}>Password strength</Text>
                    <Text style={{ color: strength.color, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}>{strength.label}</Text>
                  </View>
                  <View style={[styles.strengthTrack, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.full }]}>
                    <View style={{ height: 6, width: strength.w as any, backgroundColor: strength.color, borderRadius: 999 }} />
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrap}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, fontFamily: theme.fontFamilies.body }}>
                Confirm Password
              </Text>
              <View style={[styles.inputRow, inputStyle(!!errs.confirmPw)]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
                <TextInput
                  value={confirmPw}
                  onChangeText={(t) => { setConfirmPw(t); if (errs.confirmPw) setErrs((e) => ({ ...e, confirmPw: undefined })); }}
                  placeholder="Confirm password"
                  placeholderTextColor={theme.colors.textTertiary}
                  style={{ flex: 1, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, color: theme.colors.textPrimary }}
                  secureTextEntry={!showPw}
                  accessibilityLabel="Confirm password input"
                />
                {confirmPw && confirmPw === password ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
              </View>
              {errs.confirmPw && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} />
                  <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>{errs.confirmPw}</Text>
                </View>
              )}
            </View>

            {/* Auth error banner */}
            {authError ? (
              <View style={[styles.errorBanner, { backgroundColor: theme.colors.avoid.bg, borderColor: theme.colors.avoid.border }]}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.avoid.icon} />
                <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, flex: 1, fontFamily: theme.fontFamilies.body }}>{authError}</Text>
              </View>
            ) : null}

            {/* Create Account button */}
            <PrimaryButton
              label="Create Account"
              onPress={handleRegister}
              style={{ marginTop: 20 }}
              loading={isSubmitting}
            />

            {/* Already have an account? */}
            <TouchableOpacity onPress={() => router.back()} style={styles.loginRow} accessibilityRole="link">
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body }}>
                Already have an account?{' '}
              </Text>
              <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }}>
                Sign In
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingBottom: 24, paddingHorizontal: 24 },
  branding: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 96, height: 96 },
  successCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  form: {},
  fieldWrap: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  strengthWrap: { marginTop: 10 },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  strengthTrack: { flex: 1, height: 6 },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 3, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
