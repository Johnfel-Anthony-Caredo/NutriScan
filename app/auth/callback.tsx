/**
 * Auth Callback — handles Supabase deep-link callbacks.
 *
 * Catches password reset links (type=recovery) and other auth redirects.
 * When a recovery link is detected, shows the "Update Password" form.
 */

import { AppScreen, PrimaryButton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthCallbackScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase automatically exchanges the token from the URL fragment
    // Check if this is a password recovery flow
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsRecovery(true);
      }
    });
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.safe.bg }]}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.safe.icon} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 20 }}>
            Password Updated
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8 }}>
            Your password has been changed successfully.
          </Text>
          <PrimaryButton label="Sign In" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28 }} />
        </View>
      </AppScreen>
    );
  }

  if (!isRecovery) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center' }}>
            Processing authentication...
          </Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.centered}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="lock-closed" size={36} color={theme.colors.primary} />
        </View>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 16 }}>
          Set New Password
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Enter your new password below.
        </Text>

        <View style={[styles.inputRow, { backgroundColor: theme.colors.surfaceSecondary, borderColor: error ? theme.colors.avoid.icon : theme.colors.border, borderWidth: 1.5, borderRadius: theme.radius.md, paddingHorizontal: 16, paddingVertical: 14, width: '100%' }]}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput
            value={newPassword}
            onChangeText={(t) => { setNewPassword(t); setError(''); }}
            placeholder="New password (min 6 characters)"
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry={!showPassword}
            style={{ flex: 1, fontSize: theme.fontSizes.body, color: theme.colors.textPrimary }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
        {error ? <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginTop: 4 }}>{error}</Text> : null}

        <PrimaryButton label="Update Password" onPress={handleUpdatePassword} style={{ marginTop: 24 }} loading={isSubmitting} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  iconCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
});
