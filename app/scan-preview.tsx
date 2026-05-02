/**
 * Scan Preview — confirm captured image before analysis.
 *
 * Shows the captured image placeholder, an editable food name field,
 * meal type selector, and an Analyze button. Includes loading skeleton
 * state while analysis happens.
 */

import { AppScreen, PrimaryButton, SecondaryButton, SkeletonLoader, TopBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_OPTIONS: { key: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { key: 'snack', label: 'Snack', icon: 'cafe-outline' },
];

export default function ScanPreviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const sourceParam = Array.isArray(params.source) ? params.source[0] : params.source;
  const source = sourceParam === 'barcode' ? 'barcode' : 'photo';
  const dataParam = Array.isArray(params.data) ? params.data[0] : params.data;
  
  const [foodName, setFoodName] = useState(source === 'barcode' && dataParam ? `Scanned Barcode: ${dataParam}` : 'Detected Food Item');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      router.replace({
        pathname: '/scan-result',
        params: {
          foodName,
          mealType,
          source,
        },
      });
    }, 2000);
  };

  if (analyzing) {
    return (
      <AppScreen>
        <TopBar title="Analyzing..." />
        <View style={styles.analyzingContainer}>
          <View style={[styles.analyzingIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="scan" size={40} color={theme.colors.primary} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, marginTop: 20, textAlign: 'center' }}>
            Analyzing your food...
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 8, textAlign: 'center' }}>
            Checking nutrients against your health profile
          </Text>
          <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 32 }}>
            <SkeletonLoader rows={4} />
          </View>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Confirm Food" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}>
        {/* Image placeholder */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.lg }]}>
          <Ionicons name="image-outline" size={56} color={theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 8 }}>
            Captured image preview
          </Text>
        </View>

        {/* Editable food name */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginTop: 20, marginBottom: 8 }}>
          Food Name (tap to edit)
        </Text>
        <TextInput
          value={foodName}
          onChangeText={setFoodName}
          style={[styles.nameInput, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.md, color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold }]}
          accessibilityLabel="Food name"
        />

        {/* Meal type selector */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginTop: 20, marginBottom: 10 }}>
          Meal Type
        </Text>
        <View style={styles.mealRow}>
          {MEAL_OPTIONS.map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setMealType(m.key)}
              style={[styles.mealChip, { backgroundColor: mealType === m.key ? theme.colors.primaryLight : theme.colors.surface, borderColor: mealType === m.key ? theme.colors.primary : theme.colors.border, borderRadius: theme.radius.sm }]}
              accessibilityRole="button"
            >
              <Ionicons name={m.icon} size={16} color={mealType === m.key ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={{ color: mealType === m.key ? theme.colors.primary : theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginLeft: 4 }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={{ marginTop: 32 }}>
          <PrimaryButton label="Analyze Food" onPress={handleAnalyze} icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />} />
          <SecondaryButton label="Retake Photo" onPress={() => router.back()} style={{ marginTop: 12 }} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: { height: 220, justifyContent: 'center', alignItems: 'center' },
  nameInput: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  mealRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  mealChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  analyzingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  analyzingIcon: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
});
