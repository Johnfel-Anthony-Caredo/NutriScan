/**
 * Register Screen — full sign-up form with validation.
 */

import { AppScreen, PrimaryButton, TopBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signUp } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [info, setInfo] = useState('');
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

  const inp = (f: string) => ({
    backgroundColor: theme.colors.surfaceSecondary,
    borderColor: errs[f] ? theme.colors.avoid.icon : theme.colors.border,
    borderWidth: 1.5, borderRadius: theme.radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
  });

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');
    setInfo('');

    try {
      const data = await signUp(name.trim(), email.trim(), password);
      if (data.session) {
        router.replace('/');
      } else {
        setInfo('Check your email to confirm your account, then sign in.');
      }
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Sign up failed. Please try again.';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Create Account" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, marginBottom: 4 }}>Join NutriScan</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginBottom: 28 }}>Create your account to get personalized food guidance.</Text>

        {/* Name */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6 }}>Full Name</Text>
        <View style={[s.row, inp('name')]}>
          <Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={theme.colors.textTertiary} style={{ flex: 1, fontSize: theme.fontSizes.body, color: theme.colors.textPrimary }} />
        </View>
        {errs.name && <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 4 }}>{errs.name}</Text>}

        {/* Email */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, marginTop: 16 }}>Email</Text>
        <View style={[s.row, inp('email')]}>
          <Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={theme.colors.textTertiary} style={{ flex: 1, fontSize: theme.fontSizes.body, color: theme.colors.textPrimary }} keyboardType="email-address" autoCapitalize="none" />
        </View>
        {errs.email && <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 4 }}>{errs.email}</Text>}

        {/* Password */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, marginTop: 16 }}>Password</Text>
        <View style={[s.row, inp('password')]}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Create a password" placeholderTextColor={theme.colors.textTertiary} style={{ flex: 1, fontSize: theme.fontSizes.body, color: theme.colors.textPrimary }} secureTextEntry={!showPw} />
          <TouchableOpacity onPress={() => setShowPw(!showPw)}><Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textTertiary} /></TouchableOpacity>
        </View>
        {errs.password && <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 4 }}>{errs.password}</Text>}
        {password.length > 0 && (
          <View style={s.str}><View style={[s.track, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.full }]}><View style={{ height: 4, width: strength.w as any, backgroundColor: strength.color, borderRadius: 999 }} /></View><Text style={{ color: strength.color, fontSize: theme.fontSizes.xs, marginLeft: 8 }}>{strength.label}</Text></View>
        )}

        {/* Confirm */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6, marginTop: 16 }}>Confirm Password</Text>
        <View style={[s.row, inp('confirmPw')]}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput value={confirmPw} onChangeText={setConfirmPw} placeholder="Confirm password" placeholderTextColor={theme.colors.textTertiary} style={{ flex: 1, fontSize: theme.fontSizes.body, color: theme.colors.textPrimary }} secureTextEntry={!showPw} />
        </View>
        {errs.confirmPw && <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 4 }}>{errs.confirmPw}</Text>}

        {/* Terms */}
        <TouchableOpacity onPress={() => setTerms(!terms)} style={s.terms} accessibilityRole="checkbox" accessibilityState={{ checked: terms }}>
          <Ionicons name={terms ? 'checkbox' : 'square-outline'} size={22} color={terms ? theme.colors.primary : theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginLeft: 10, flex: 1 }}>I agree to the Terms and Privacy Policy</Text>
        </TouchableOpacity>
        {errs.terms && <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 4 }}>{errs.terms}</Text>}

        {authError ? (
          <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 12 }}>{authError}</Text>
        ) : null}
        {info ? (
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginTop: 12 }}>{info}</Text>
        ) : null}

        <PrimaryButton label="Create Account" onPress={handleRegister} style={{ marginTop: 20 }} loading={isSubmitting} />

        <TouchableOpacity onPress={() => router.back()} style={s.login}><Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body }}>Already have an account? </Text><Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold }}>Sign In</Text></TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  str: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  track: { flex: 1, height: 4 },
  terms: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, paddingVertical: 4 },
  login: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});
