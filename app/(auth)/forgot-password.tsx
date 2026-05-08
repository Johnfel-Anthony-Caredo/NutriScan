/**
 * Forgot Password Screen — email-based password reset.
 */

import { AppScreen, Card, PrimaryButton, TopBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { resetPassword } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.colors.surfaceSecondary,
    borderColor: error ? theme.colors.avoid.icon : focused ? theme.colors.primary : theme.colors.border,
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    minHeight: 56,
  };

  if (sent) {
    return (
      <AppScreen noPadding>
        <TopBar title="Check Your Email" showBack />
        <View style={styles.sentContainer}>
          <View style={[styles.sentCircle, { backgroundColor: theme.colors.safe.bg }]}>
            <Ionicons name="mail-open" size={48} color={theme.colors.safe.icon} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 20 }}>
            Email Sent!
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, maxWidth: 280, lineHeight: theme.lineHeights.body }}>
            {"We've sent password reset instructions to "}
            <Text style={{ fontWeight: theme.fontWeights.semibold, color: theme.colors.textPrimary }}>{email}</Text>
          </Text>
          <Card style={{ marginTop: 28, width: '100%' }}>
            <View style={styles.tipRow}>
              <Ionicons name="information-circle" size={18} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginLeft: 8, flex: 1 }}>
                {"Didn't receive the email? Check your spam folder or try again."}
              </Text>
            </View>
          </Card>
          <PrimaryButton label="Back to Sign In" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28, width: '100%', height: 56, borderRadius: theme.radius.lg }} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen noPadding>
      <TopBar title="Reset Password" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="key-outline" size={36} color={theme.colors.primary} />
        </View>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 16 }}>
          Forgot your password?
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, lineHeight: theme.lineHeights.body, maxWidth: 320 }}>
          {"Enter your email and we'll send you instructions to reset your password."}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: theme.radius.xl, ...theme.shadows.sm }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 6 }}>Email</Text>
          <View style={[styles.inputRow, inputStyle]}>
            <Ionicons name="mail-outline" size={18} color={focused ? theme.colors.primary : theme.colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput value={email} onChangeText={(t) => { setEmail(t); setError(''); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="your@email.com" placeholderTextColor={theme.colors.textTertiary} style={styles.inputText} keyboardType="email-address" autoCapitalize="none" />
            {email.trim() ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
          </View>
          {error ? <View style={styles.errorRow}><Ionicons name="alert-circle" size={14} color={theme.colors.avoid.icon} /><Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm }}>{error}</Text></View> : null}

          <PrimaryButton label="Send Reset Link" onPress={handleSend} style={{ marginTop: 24, height: 56, borderRadius: theme.radius.lg }} loading={isSubmitting} />
        </View>
      </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  card: { borderWidth: 1, padding: 20, marginTop: 28 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputText: { flex: 1, fontSize: 16, paddingVertical: 16 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  sentContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 60 },
  sentCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
