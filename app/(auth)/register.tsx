/**
 * Register Screen — full sign-up form with validation.
 */

import { AppScreen, PrimaryButton, TopBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signUp } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirmPw' | null>(null);
  const [terms, setTerms] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [info, setInfo] = useState('');
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
    if (!terms) e.terms = 'Please accept terms';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const inp = (f: string, isFocused: boolean) => ({
    backgroundColor: theme.colors.surfaceSecondary,
    borderColor: errs[f] ? theme.colors.avoid.icon : isFocused ? theme.colors.primary : theme.colors.border,
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    minHeight: 56,
  });

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');
    setInfo('');

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

  // Email verification sent — show confirmation
  if (emailSent) {
    return (
      <AppScreen noPadding>
        <TopBar title="Check Your Email" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 60 }}>
          <View style={[{ width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: theme.colors.safe.bg }]}>
            <Ionicons name="mail-open" size={48} color={theme.colors.safe.icon} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 20 }}>
            Verify your email
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, maxWidth: 280, lineHeight: theme.lineHeights.body }}>
            We sent a confirmation link to{' '}
            <Text style={{ fontWeight: theme.fontWeights.semibold, color: theme.colors.textPrimary }}>{email}</Text>
            {'. '}Check your inbox and tap the link to activate your account.
          </Text>
          <PrimaryButton label="Go to Sign In" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28, width: '100%' }} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Create Account" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboardWrap}>
        <View style={s.container}>
          <View style={s.hero}>
            <View style={[s.heroIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="person-add-outline" size={28} color={theme.colors.primary} />
            </View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, marginTop: 16, textAlign: 'center' }}>Join NutriScan</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center', lineHeight: theme.lineHeights.body, maxWidth: 320 }}>
              Create your account to get personalized food guidance.
            </Text>
          </View>

          <View style={[s.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: theme.radius.xl, ...theme.shadows.sm }]}>

        {/* Name */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6 }}>Full Name</Text>
        <View style={[s.row, inp('name', focusedField === 'name')]}>
          <Ionicons name="person-outline" size={18} color={focusedField === 'name' ? theme.colors.primary : theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} placeholder="John Doe" placeholderTextColor={theme.colors.textTertiary} style={s.inputText} />
          {name.trim() ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
        </View>
        {errs.name ? <View style={s.errorRow}><Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm }}>{errs.name}</Text></View> : null}

        {/* Email */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, marginTop: 18 }}>Email</Text>
        <View style={[s.row, inp('email', focusedField === 'email')]}>
          <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? theme.colors.primary : theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={email} onChangeText={setEmail} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="your@email.com" placeholderTextColor={theme.colors.textTertiary} style={s.inputText} keyboardType="email-address" autoCapitalize="none" />
          {email.trim() ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
        </View>
        {errs.email ? <View style={s.errorRow}><Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm }}>{errs.email}</Text></View> : null}

        {/* Password */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, marginTop: 18 }}>Password</Text>
        <View style={[s.row, inp('password', focusedField === 'password')]}>
          <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? theme.colors.primary : theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={password} onChangeText={setPassword} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Create a password" placeholderTextColor={theme.colors.textTertiary} style={s.inputText} secureTextEntry={!showPw} />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={8}><Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={focusedField === 'password' ? theme.colors.primary : theme.colors.textTertiary} /></TouchableOpacity>
        </View>
        {errs.password ? <View style={s.errorRow}><Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm }}>{errs.password}</Text></View> : null}
        {password.length > 0 && (
          <View style={s.strengthWrap}>
            <View style={s.strengthHeader}><Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.xs }}>Password strength</Text><Text style={{ color: strength.color, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold }}>{strength.label}</Text></View>
            <View style={[s.track, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.full }]}><View style={{ height: 6, width: strength.w as any, backgroundColor: strength.color, borderRadius: 999 }} /></View>
          </View>
        )}

        {/* Confirm */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, marginTop: 18 }}>Confirm Password</Text>
        <View style={[s.row, inp('confirmPw', focusedField === 'confirmPw')]}>
          <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'confirmPw' ? theme.colors.primary : theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={confirmPw} onChangeText={setConfirmPw} onFocus={() => setFocusedField('confirmPw')} onBlur={() => setFocusedField(null)} placeholder="Confirm password" placeholderTextColor={theme.colors.textTertiary} style={s.inputText} secureTextEntry={!showPw} />
          {confirmPw && confirmPw === password ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
        </View>
        {errs.confirmPw ? <View style={s.errorRow}><Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm }}>{errs.confirmPw}</Text></View> : null}

        {/* Terms */}
        <View style={[s.termsCard, { backgroundColor: theme.colors.surfaceSecondary, borderColor: errs.terms ? theme.colors.avoid.border : theme.colors.borderLight, borderRadius: theme.radius.lg }]}>
          <TouchableOpacity onPress={() => setTerms(!terms)} style={s.terms} accessibilityRole="checkbox" accessibilityState={{ checked: terms }}>
            <Ionicons name={terms ? 'checkbox' : 'square-outline'} size={22} color={terms ? theme.colors.primary : theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginLeft: 10, flex: 1, lineHeight: 20 }}>I agree to the Terms and Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        {errs.terms ? <View style={s.errorRow}><Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm }}>{errs.terms}</Text></View> : null}

        {authError ? <View style={[s.banner, { backgroundColor: theme.colors.avoid.bg, borderColor: theme.colors.avoid.border }]}><Ionicons name="alert-circle" size={16} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, flex: 1 }}>{authError}</Text></View> : null}
        {info ? <View style={[s.banner, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}><Ionicons name="information-circle" size={16} color={theme.colors.primary} /><Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, flex: 1 }}>{info}</Text></View> : null}

        <PrimaryButton
          label="Create Account"
          onPress={handleRegister}
          style={{ ...s.primaryButton, borderRadius: theme.radius.lg }}
          loading={isSubmitting}
        />
          </View>

          <TouchableOpacity onPress={() => router.back()} style={s.login}><Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body }}>Already have an account? </Text><Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, textDecorationLine: 'underline' }}>Sign In</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  keyboardWrap: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  inputText: { flex: 1, fontSize: 16, paddingVertical: 16 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  strengthWrap: { marginTop: 10 },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { flex: 1, height: 6 },
  termsCard: { borderWidth: 1, marginTop: 20, paddingHorizontal: 14, paddingVertical: 10 },
  terms: { flexDirection: 'row', alignItems: 'flex-start' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14 },
  primaryButton: { marginTop: 22, height: 56 },
  login: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
});
