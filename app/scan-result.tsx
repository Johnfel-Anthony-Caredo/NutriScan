/**
 * Scan Result Screen — the verdict experience.
 *
 * Shows the large verdict badge, food details, illness alert,
 * explanation, nutrient breakdown, alternatives, and log CTA.
 * Uses mock data for now — will connect to real API in future.
 */

import { AppScreen, Card, NutrientRow, PrimaryButton, SecondaryButton, SectionHeader, TopBar, VerdictBadge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { ScanResultData } from '@/data/mockData';
import { useTheme } from '@/hooks/useTheme';
import { uploadScanImage } from '@/services/storageService';
import { insertScanLog } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function ScanResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    foodName?: string;
    mealType?: string;
    source?: string;
    imageUri?: string;
    resultData?: string;
  }>();
  const [isSaving, setIsSaving] = useState(false);
  const [logError, setLogError] = useState('');
  const [logged, setLogged] = useState(false);

  const foodNameParam = Array.isArray(params.foodName) ? params.foodName[0] : params.foodName;
  const mealTypeParam = Array.isArray(params.mealType) ? params.mealType[0] : params.mealType;
  const sourceParam = Array.isArray(params.source) ? params.source[0] : params.source;
  const imageUriParam = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;
  const resultDataParam = Array.isArray(params.resultData) ? params.resultData[0] : params.resultData;

  const mealType = mealTypes.includes(mealTypeParam as MealType)
    ? (mealTypeParam as MealType)
    : 'lunch';

  const source = sourceParam === 'barcode' || sourceParam === 'manual' ? sourceParam : 'photo';

  // Parse the real scan result data from params
  const result: ScanResultData | null = useMemo(() => {
    if (resultDataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(resultDataParam));
        parsed.mealType = mealType;
        parsed.scannedAt = new Date().toISOString();
        return parsed as ScanResultData;
      } catch (e) {
        console.warn('Failed to parse resultData:', e);
      }
    }
    return null;
  }, [resultDataParam, mealType]);

  // If no result data, show an error state
  if (!result) {
    return (
      <AppScreen>
        <TopBar title="Scan Result" showBack onBack={() => router.replace('/(tabs)')} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="cloud-offline-outline" size={56} color={theme.colors.caution.icon} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, textAlign: 'center', marginTop: 16 }}>
            No scan data available
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, textAlign: 'center', marginTop: 8 }}>
            The scan analysis result was not received. Please try scanning again.
          </Text>
          <PrimaryButton label="Go to Scan" onPress={() => router.replace('/(tabs)/scan')} style={{ marginTop: 24 }} />
        </View>
      </AppScreen>
    );
  }

  const [showAllNutrients, setShowAllNutrients] = useState(false);

  const relevantNutrients = result.nutrients.filter((n) => n.overLimit || n.warning);
  const otherNutrients = result.nutrients.filter((n) => !n.overLimit && !n.warning);
  const displayNutrients = showAllNutrients ? result.nutrients : relevantNutrients.length > 0 ? relevantNutrients : result.nutrients.slice(0, 3);

  const handleLog = async () => {
    if (!user) {
      setLogError('Please sign in to save scans.');
      return;
    }

    setIsSaving(true);
    setLogError('');

    try {
      let imageUrl: string | undefined;

      if (imageUriParam) {
        imageUrl = await uploadScanImage(user.id, imageUriParam);
      }

      await insertScanLog(user.id, result, source, imageUrl);
      setLogged(true);
      setTimeout(() => router.replace('/(tabs)'), 1200);
    } catch {
      setLogError('Unable to save your scan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Scan Result" showBack onBack={() => router.replace('/(tabs)')} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>

        {/* ── Verdict Header ─────────────── */}
        <View style={styles.verdictHeader}>
          <VerdictBadge verdict={result.verdict} large />
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 16 }}>
            {result.foodName}
          </Text>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginTop: 4 }}>
            {result.mealType.charAt(0).toUpperCase() + result.mealType.slice(1)} · {new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* ── Alert Card (for caution/avoid) ── */}
        {(result.verdict === 'caution' || result.verdict === 'avoid') && (
          <Card style={[styles.alertCard, { backgroundColor: theme.colors[result.verdict].bg, borderColor: theme.colors.border }]}>
            <View style={styles.alertRow}>
              <Ionicons name={result.verdict === 'avoid' ? 'warning' : 'alert-circle'} size={22} color={theme.colors[result.verdict].icon} />
              <Text style={{ color: theme.colors[result.verdict].text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>
                {result.verdict === 'avoid' ? 'Not recommended for you' : 'Use with caution'}
              </Text>
            </View>
            <Text style={{ color: theme.colors[result.verdict].text, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, lineHeight: theme.lineHeights.body, marginTop: 8 }}>
              {result.explanation}
            </Text>
          </Card>
        )}

        {/* ── Safe message ─────────────────── */}
        {result.verdict === 'safe' && result.safeMessage && (
          <Card style={[styles.alertCard, { backgroundColor: theme.colors.safe.bg, borderColor: theme.colors.border }]}>
            <View style={styles.alertRow}>
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.safe.icon} />
              <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 8, flex: 1 }}>
                {result.safeMessage}
              </Text>
            </View>
          </Card>
        )}

        {/* ── Nutrients ────────────────────── */}
        <SectionHeader title={relevantNutrients.length > 0 ? 'Key Nutrients to Watch' : 'Nutrition Facts'} />
        <Card>
          {displayNutrients.map((n) => (
            <NutrientRow key={n.nutrient} nutrient={n} />
          ))}
          {!showAllNutrients && otherNutrients.length > 0 && relevantNutrients.length > 0 && (
            <TouchableOpacity onPress={() => setShowAllNutrients(true)} style={styles.showMore} accessibilityRole="button">
              <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium }}>
                Show all {result.nutrients.length} nutrients
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Alternatives ─────────────────── */}
        {result.alternatives && result.alternatives.length > 0 && (
          <>
            <SectionHeader title="Better Alternatives" />
            <Card>
              {result.alternatives.map((alt) => (
                <View key={alt.name} style={[styles.altRow, { borderBottomColor: theme.colors.border }]}>
                  <Ionicons name="swap-horizontal" size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontFamily: theme.fontFamilies.body, flex: 1 }}>{alt.name}</Text>
                  <VerdictBadge verdict={alt.verdict} />
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Actions ──────────────────────── */}
        <View style={styles.actions}>
          {!logged ? (
            <>
              {logError ? (
                <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.sm, marginBottom: 8 }}>
                  {logError}
                </Text>
              ) : null}
              <PrimaryButton
                label="Add to Food Log"
                onPress={handleLog}
                icon={<Ionicons name="add-circle" size={20} color="#FFFFFF" />}
                loading={isSaving}
              />
            </>
          ) : (
            <Card style={{ backgroundColor: theme.colors.safe.bg, borderColor: theme.colors.border, alignItems: 'center', paddingVertical: 16 }}>
              <Ionicons name="checkmark-circle" size={28} color={theme.colors.safe.icon} />
              <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginTop: 6 }}>
                Added to your food log!
              </Text>
            </Card>
          )}
          <SecondaryButton label="Scan Another" onPress={() => router.replace('/(tabs)/scan')} style={{ marginTop: 12 }} icon={<Ionicons name="scan" size={18} color={theme.colors.primary} />} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  verdictHeader: { alignItems: 'center', paddingVertical: 20, marginBottom: 8 },
  alertCard: { borderWidth: 3, marginBottom: 24 },
  alertRow: { flexDirection: 'row', alignItems: 'center' },
  showMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 12, gap: 4 },
  altRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2 },
  actions: { marginTop: 28 },
});
