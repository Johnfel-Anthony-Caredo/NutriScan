/**
 * Scan Result Screen — the verdict experience.
 *
 * Shows the large verdict badge, food details, illness alert,
 * explanation, nutrient breakdown, alternatives, and log CTA.
 * Uses mock data for now — will connect to real API in future.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, Card, VerdictBadge, PrimaryButton, SecondaryButton, NutrientRow, SectionHeader } from '@/components/ui';
import { MOCK_RESULT_AVOID } from '@/data/mockData';

export default function ScanResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const result = MOCK_RESULT_AVOID;
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [logged, setLogged] = useState(false);

  const relevantNutrients = result.nutrients.filter((n) => n.overLimit || n.warning);
  const otherNutrients = result.nutrients.filter((n) => !n.overLimit && !n.warning);
  const displayNutrients = showAllNutrients ? result.nutrients : relevantNutrients.length > 0 ? relevantNutrients : result.nutrients.slice(0, 3);

  const handleLog = () => {
    setLogged(true);
    setTimeout(() => router.replace('/(tabs)'), 1200);
  };

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Scan Result" showBack onBack={() => router.replace('/(tabs)')} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>

        {/* ── Verdict Header ─────────────── */}
        <View style={styles.verdictHeader}>
          <VerdictBadge verdict={result.verdict} large />
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, marginTop: 16 }}>
            {result.foodName}
          </Text>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 4 }}>
            {result.mealType.charAt(0).toUpperCase() + result.mealType.slice(1)} · {new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* ── Alert Card (for caution/avoid) ── */}
        {(result.verdict === 'caution' || result.verdict === 'avoid') && (
          <Card style={[styles.alertCard, { backgroundColor: theme.colors[result.verdict].bg, borderColor: theme.colors[result.verdict].border }]}>
            <View style={styles.alertRow}>
              <Ionicons name={result.verdict === 'avoid' ? 'warning' : 'alert-circle'} size={22} color={theme.colors[result.verdict].icon} />
              <Text style={{ color: theme.colors[result.verdict].text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginLeft: 8 }}>
                {result.verdict === 'avoid' ? 'Not recommended for you' : 'Use with caution'}
              </Text>
            </View>
            <Text style={{ color: theme.colors[result.verdict].text, fontSize: theme.fontSizes.body, lineHeight: theme.lineHeights.body, marginTop: 8 }}>
              {result.explanation}
            </Text>
          </Card>
        )}

        {/* ── Safe message ─────────────────── */}
        {result.verdict === 'safe' && result.safeMessage && (
          <Card style={[styles.alertCard, { backgroundColor: theme.colors.safe.bg, borderColor: theme.colors.safe.border }]}>
            <View style={styles.alertRow}>
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.safe.icon} />
              <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginLeft: 8, flex: 1 }}>
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
                <View key={alt.name} style={[styles.altRow, { borderBottomColor: theme.colors.borderLight }]}>
                  <Ionicons name="swap-horizontal" size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, flex: 1 }}>{alt.name}</Text>
                  <VerdictBadge verdict={alt.verdict} />
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Actions ──────────────────────── */}
        <View style={styles.actions}>
          {!logged ? (
            <PrimaryButton label="Add to Food Log" onPress={handleLog} icon={<Ionicons name="add-circle" size={20} color="#FFFFFF" />} />
          ) : (
            <Card style={{ backgroundColor: theme.colors.safe.bg, alignItems: 'center', paddingVertical: 16 }}>
              <Ionicons name="checkmark-circle" size={28} color={theme.colors.safe.icon} />
              <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginTop: 6 }}>
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
  alertCard: { borderWidth: 1, marginBottom: 24 },
  alertRow: { flexDirection: 'row', alignItems: 'center' },
  showMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 12, gap: 4 },
  altRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  actions: { marginTop: 28 },
});
