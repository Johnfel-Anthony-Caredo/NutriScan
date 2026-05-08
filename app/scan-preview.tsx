/**
 * Scan Preview — confirm captured image before analysis.
 *
 * Handles both photo and barcode sources:
 * - Photo: captures image, calls scan-ai Edge Function for verdict
 * - Barcode: calls Open Food Facts API, optionally enriches via scan-ai
 * Navigates to scan-result with the real data.
 */

import { AppScreen, PrimaryButton, SecondaryButton, SkeletonLoader, TopBar } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import type { ScanResultData } from '@/data/mockData';
import { useTheme } from '@/hooks/useTheme';
import { analyzeBarcodeWithAi, analyzeFoodPhoto, analyzeTextFood, buildScanResultFromAiResponse, buildScanResultFromBarcode, lookupBarcode, type BarcodeProductData } from '@/services/scanService';
import { optimizeImageForUpload } from '@/utils/optimizeImage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ source?: string; uri?: string; data?: string; foodName?: string }>();
  const sourceParam = Array.isArray(params.source) ? params.source[0] : params.source;
  const uriParam = Array.isArray(params.uri) ? params.uri[0] : params.uri;
  const dataParam = Array.isArray(params.data) ? params.data[0] : params.data;
  const foodNameParam = Array.isArray(params.foodName) ? params.foodName[0] : params.foodName;
  
  const source = sourceParam === 'barcode' ? 'barcode' : sourceParam === 'manual' ? 'manual' : 'photo';
  
  const [foodName, setFoodName] = useState(
    source === 'barcode' && dataParam ? `Barcode: ${dataParam}`
    : source === 'manual' && foodNameParam ? foodNameParam
    : 'Detected Food Item',
  );
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcodeData, setBarcodeData] = useState<BarcodeProductData | null>(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // For barcode source: auto-lookup Open Food Facts on mount
  useEffect(() => {
    if (source === 'barcode' && dataParam) {
      setBarcodeLoading(true);
      setFoodName(`Looking up barcode ${dataParam}...`);
      lookupBarcode(dataParam).then((data) => {
        if (data) {
          setBarcodeData(data);
          setFoodName(data.productName);
        } else {
          setFoodName(`Product ${dataParam}`);
          setError('Barcode not found in public database. AI will analyze based on barcode ID.');
        }
      }).catch(() => {
        setError('Failed to look up barcode. Analysis may be limited.');
      }).finally(() => {
        setBarcodeLoading(false);
      });
    }
  }, [source, dataParam]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      let result: ScanResultData;

      if (source === 'barcode') {
        // Barcode flow
        if (barcodeData && Object.keys(barcodeData.nutrients).length > 2) {
          // Open Food Facts has good data — use it directly with a basic verdict
          result = buildScanResultFromBarcode(barcodeData, mealType);
          
          // If the result has limited nutrients, enrich via AI
          if (result.nutrients.length < 3) {
            try {
              const aiResponse = await analyzeBarcodeWithAi(barcodeData, {
                conditions: profile.conditions,
                goals: profile.goals,
                nutrientTargets: profile.nutrientTargets,
              });
              result = buildScanResultFromAiResponse(aiResponse, mealType, source);
            } catch (aiErr) {
              console.warn('AI enrichment failed, using direct barcode data:', aiErr);
            }
          }
        } else {
          // Barcode found but limited data, or not found — use AI with what we have
          const aiResponse = await analyzeBarcodeWithAi(
            barcodeData || {
              productName: `Product ${dataParam || ''}`,
              barcode: dataParam || '',
              nutrients: {},
            },
            {
              conditions: profile.conditions,
              goals: profile.goals,
              nutrientTargets: profile.nutrientTargets,
            },
          );
          result = buildScanResultFromAiResponse(aiResponse, mealType, source);
        }
      } else if (source === 'manual') {
        // Manual search — send food name to AI for text-only analysis
        const aiResponse = await analyzeTextFood(foodName, {
          conditions: profile.conditions,
          goals: profile.goals,
          nutrientTargets: profile.nutrientTargets,
        });
        result = buildScanResultFromAiResponse(aiResponse, mealType, 'manual');
      } else {
        // Photo flow — optimize image (resize + compress), then call scan-ai
        const { base64, mimeType } = await optimizeImageForUpload(uriParam!, {
          maxWidth: 1200,
          compress: 0.6,
        });

        const aiResponse = await analyzeFoodPhoto(
          base64,
          mimeType,
          {
            conditions: profile.conditions,
            goals: profile.goals,
            nutrientTargets: profile.nutrientTargets,
          },
          barcodeData,
        );
        result = buildScanResultFromAiResponse(aiResponse, mealType, 'photo');
      }

      // Navigate to result with data encoded as JSON param
      router.replace({
        pathname: '/scan-result',
        params: {
          foodName: result.foodName,
          mealType: result.mealType,
          source: result.id.startsWith('barcode') ? 'barcode' : source,
          imageUri: uriParam || '',
          resultData: encodeURIComponent(JSON.stringify(result)),
        },
      });
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <AppScreen>
        <TopBar title="Analyzing..." />
        <View style={styles.analyzingContainer}>
          <View style={[styles.analyzingIcon, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
            <Ionicons name="scan" size={40} color={theme.colors.primary} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 20, textAlign: 'center' }}>
            {barcodeLoading ? 'Looking up product...' : 'Analyzing your food...'}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, marginTop: 8, textAlign: 'center' }}>
            {barcodeLoading
              ? 'Searching Open Food Facts database'
              : 'Checking nutrients against your health profile'}
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
        {/* Captured image — show the actual photo for camera captures */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.lg, overflow: 'hidden' }]}>
          {source === 'photo' && uriParam ? (
            <Image source={{ uri: uriParam }} style={styles.capturedImage} contentFit="cover" />
          ) : source === 'barcode' ? (
            <>
              <Ionicons name="barcode-outline" size={56} color={theme.colors.textTertiary} />
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 8 }}>
                Barcode: {dataParam || 'N/A'}
              </Text>
              {barcodeData?.imageUrl && (
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>
                  Product image available
                </Text>
              )}
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={56} color={theme.colors.textTertiary} />
              <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 8 }}>
                Captured image preview
              </Text>
            </>
          )}
        </View>

        {/* Error message */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.avoid.bg, borderColor: theme.colors.avoid.border, borderRadius: theme.radius.md }]}>
            <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>
              {error}
            </Text>
          </View>
        )}

        {/* Editable food name */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginTop: 20, marginBottom: 8, fontFamily: theme.fontFamilies.body }}>
          Food Name (tap to edit)
        </Text>
        <TextInput
          value={foodName}
          onChangeText={setFoodName}
          style={[styles.nameInput, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.md, color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body }]}
          accessibilityLabel="Food name"
        />

        {/* Meal type selector */}
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginTop: 20, marginBottom: 10, fontFamily: theme.fontFamilies.body }}>
          Meal Type
        </Text>
        <View style={styles.mealRow}>
          {MEAL_OPTIONS.map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setMealType(m.key)}
              style={[styles.mealChip, { backgroundColor: mealType === m.key ? theme.colors.primaryLight : theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.sm }]}
              accessibilityRole="button"
            >
              <Ionicons name={m.icon} size={16} color={mealType === m.key ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={{ color: mealType === m.key ? theme.colors.primary : theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginLeft: 4 }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={{ marginTop: 32 }}>
          <PrimaryButton
            label={barcodeLoading ? 'Loading product data...' : 'Analyze Food'}
            onPress={handleAnalyze}
            disabled={barcodeLoading}
            icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />}
          />
          <SecondaryButton label="Retake Photo" onPress={() => router.back()} style={{ marginTop: 12 }} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: { height: 220, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 3 },
  capturedImage: { width: '100%', height: '100%' },
  nameInput: { borderWidth: 3, paddingHorizontal: 16, paddingVertical: 14 },
  mealRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  mealChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 3 },
  analyzingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  analyzingIcon: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  errorBox: { marginTop: 12, padding: 12, borderWidth: 3 },
});
