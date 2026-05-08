/**
 * Edit Profile Screen — editable personal information form.
 *
 * Allows users to update name, age, height, weight, and blood type.
 * Saves changes to Supabase and syncs back into ProfileContext.
 */

import { AppScreen, Card, PrimaryButton, TopBar } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { updateUserProfile } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();

  // Form state — prefilled from current profile
  const [name, setName] = useState(profile.name ?? '');
  const [age, setAge] = useState(profile.age?.toString() ?? '');
  const [height, setHeight] = useState(profile.heightCm?.toString() ?? '');
  const [weight, setWeight] = useState(profile.weightKg?.toString() ?? '');
  const [bloodType, setBloodType] = useState(profile.bloodType ?? '');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const avatarUri = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

  // ── Validation ──────────────────────────────────────────────────
  const validate = (): string | null => {
    const trimmedName = name.trim();
    if (trimmedName.length > 0 && trimmedName.length < 2) {
      return 'Name must be at least 2 characters.';
    }
    if (trimmedName.length > 50) {
      return 'Name is too long (max 50 characters).';
    }

    if (age.trim().length > 0) {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return 'Please enter a valid age (1–120).';
      }
    }

    if (height.trim().length > 0) {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
        return 'Please enter a valid height (50–300 cm).';
      }
    }

    if (weight.trim().length > 0) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) {
        return 'Please enter a valid weight (10–500 kg).';
      }
    }

    return null;
  };

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    const error = validate();
    if (error) {
      setSaveError(error);
      return;
    }

    if (!user) {
      setSaveError('You must be signed in to save changes.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const updates: {
        name?: string;
        age?: number;
        height_cm?: number;
        weight_kg?: number;
        blood_type?: string;
      } = {};

      const trimmedName = name.trim();
      if (trimmedName.length > 0) updates.name = trimmedName;
      else updates.name = '';

      if (age.trim().length > 0) updates.age = parseInt(age, 10);
      if (height.trim().length > 0) updates.height_cm = parseFloat(height);
      if (weight.trim().length > 0) updates.weight_kg = parseFloat(weight);
      if (bloodType.length > 0) updates.blood_type = bloodType;
      else updates.blood_type = '';

      // Save to Supabase
      await updateUserProfile(user.id, updates);

      // Sync into local ProfileContext
      updateProfile({
        name: updates.name || undefined,
        age: updates.age,
        heightCm: updates.height_cm,
        weightKg: updates.weight_kg,
        bloodType: updates.blood_type || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => router.back(), 800);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Styled input helper ─────────────────────────────────────────
  const renderField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'numeric' | 'decimal-pad';
      suffix?: string;
      maxLength?: number;
    }
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }]}>
        {label}
      </Text>
      <View style={[styles.inputRow, { backgroundColor: theme.colors.surfaceSecondary, borderColor: focusedField === label ? theme.colors.primary : theme.colors.borderLight, borderRadius: theme.radius.lg }]}>
        <Ionicons name={label === 'Name' ? 'person-outline' : label === 'Age' ? 'time-outline' : label === 'Height' ? 'body-outline' : 'barbell-outline'} size={18} color={focusedField === label ? theme.colors.primary : theme.colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={(text) => {
            setSaveError('');
            setSaveSuccess(false);
            onChange(text);
          }}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
          placeholder={options?.placeholder ?? ''}
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType={options?.keyboardType ?? 'default'}
          maxLength={options?.maxLength ?? 50}
          style={[styles.input, { color: theme.colors.textPrimary, fontSize: theme.fontSizes.body }]}
          autoCapitalize={label === 'Name' ? 'words' : 'none'}
        />
        {options?.suffix && (
          <Text style={[styles.suffix, { color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }]}>
            {options.suffix}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Edit Profile" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
      <View style={styles.container}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.borderLight }]}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSecondary }]}>
              {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <Ionicons name="person" size={40} color={theme.colors.primary} />}
            </View>
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, marginTop: 14 }}>
            Personal Information
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginTop: 6, textAlign: 'center', lineHeight: theme.lineHeights.sm }}>
            Update the details used across your health profile.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginBottom: 18 }}>Basic details</Text>
          {renderField('Name', name, setName, { placeholder: 'Your full name' })}
          {renderField('Age', age, setAge, { placeholder: 'e.g. 28', keyboardType: 'numeric', suffix: 'years', maxLength: 3 })}
          {renderField('Height', height, setHeight, { placeholder: 'e.g. 170', keyboardType: 'decimal-pad', suffix: 'cm', maxLength: 5 })}
          {renderField('Weight', weight, setWeight, { placeholder: 'e.g. 68', keyboardType: 'decimal-pad', suffix: 'kg', maxLength: 5 })}

          {/* ── Blood Type Picker ──────────── */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }]}>
              Blood Type
            </Text>
            <View style={styles.bloodTypeGrid}>
              {BLOOD_TYPES.map((bt) => {
                const isSelected = bloodType === bt;
                return (
                  <TouchableOpacity
                    key={bt}
                    onPress={() => {
                      setSaveError('');
                      setSaveSuccess(false);
                      setBloodType(isSelected ? '' : bt);
                    }}
                    style={[
                      styles.bloodTypeChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={{
                      color: isSelected ? theme.colors.textInverse : theme.colors.textPrimary,
                      fontSize: theme.fontSizes.sm,
                      fontWeight: isSelected ? theme.fontWeights.semibold : theme.fontWeights.regular,
                    }}>
                      {bt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        {/* ── Feedback ─────────────────────── */}
        {saveError ? (
          <View style={[styles.feedbackRow, { backgroundColor: theme.colors.avoid.bg, borderColor: theme.colors.avoid.border, borderRadius: theme.radius.md }]}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.avoid.icon} />
            <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginLeft: 8, flex: 1 }}>
              {saveError}
            </Text>
          </View>
        ) : null}

        {saveSuccess ? (
          <View style={[styles.feedbackRow, { backgroundColor: theme.colors.safe.bg, borderColor: theme.colors.safe.border, borderRadius: theme.radius.md }]}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.safe.icon} />
            <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes.sm, marginLeft: 8, flex: 1 }}>
              Profile updated successfully!
            </Text>
          </View>
        ) : null}

        {/* ── Save Button ──────────────────── */}
        <PrimaryButton
          label={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving || saveSuccess}
          icon={!isSaving && !saveSuccess ? <Ionicons name="checkmark" size={20} color="#FFFFFF" /> : undefined}
          style={styles.saveButton}
        />
      </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarRing: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatar: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  formCard: { marginBottom: 12 },
  fieldContainer: { marginBottom: 18 },
  fieldLabel: { marginBottom: 8, fontWeight: '500' as const },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, minHeight: 54 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, paddingHorizontal: 0 },
  suffix: { marginLeft: 8 },
  bloodTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodTypeChip: { paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1, minWidth: 58, alignItems: 'center' },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, marginTop: 14 },
  saveButton: { marginTop: 24, height: 56 },
});
