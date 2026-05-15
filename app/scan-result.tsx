/**
 * Scan Result Screen — visual nutrition card layout.
 *
 * Shows the captured food image, a color-coded verdict card, a
 * macro-nutrient visualization grid, detailed nutrient rows,
 * better alternatives, and a clean action area.
 */

import {
  AppScreen,
  Card,
  PrimaryButton,
  SecondaryButton,
  TopBar,
  VerdictBadge,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { ScanResultData, NutrientInfo } from '@/data/mockData';
import type { Verdict } from '@/types/health';
import { useTheme } from '@/hooks/useTheme';
import { getResolvedImageUrl, uploadScanImage } from '@/services/storageService';
import { getScanLogById, insertScanLog } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Types ───────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

interface MacroDatum {
  key: string;
  label: string;
  value: number;
  dailyLimit: number;
  unit: string;
  color: string;
  bgTint: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MACRO_COLORS = {
  calories: { color: '#00897B', bg: '#E0F2F1', icon: 'flame-outline' as const },
  protein: { color: '#4A90D9', bg: '#E8F0FB', icon: 'fitness-outline' as const },
  carbohydrates: {
    color: '#E8A838',
    bg: '#FDF5E6',
    icon: 'restaurant-outline' as const,
  },
  saturated_fat: {
    color: '#E05A4A',
    bg: '#FDEEEC',
    icon: 'color-filter-outline' as const,
  },
};

const MACRO_LABELS: Record<string, string> = {
  calories: 'Calories',
  protein: 'Protein',
  carbohydrates: 'Carbs',
  saturated_fat: 'Fat',
};

// ── Sub-components ───────────────────────────────────────────────────

function ConfidenceBadge({
  confidence,
  theme,
}: {
  confidence?: number;
  theme: any;
}) {
  if (confidence === undefined) return null;
  const high = confidence >= 0.8;
  const mid = confidence >= 0.5 && confidence < 0.8;
  const bg = high ? '#E8F5E9' : mid ? '#FFF8E1' : '#FFEBEE';
  const fg = high ? '#2E7D32' : mid ? '#F57F17' : '#C62828';
  const iconName = high
    ? 'checkmark-circle'
    : mid
      ? 'help-circle'
      : 'alert-circle';

  return (
    <View
      style={[
        styles.confidenceBadge,
        { backgroundColor: bg, borderRadius: 10 },
      ]}
    >
      <Ionicons name={iconName} size={12} color={fg} />
      <Text
        style={{
          color: fg,
          fontSize: 11,
          fontWeight: '600',
          fontFamily: theme.fontFamilies?.body,
          marginLeft: 4,
        }}
      >
        {high ? 'Identified' : `${Math.round(confidence * 100)}%`}
      </Text>
    </View>
  );
}

/** Single macro card with large value + progress bar */
function MacroCard({
  macro,
  theme,
}: {
  macro: MacroDatum;
  theme: any;
}) {
  const pct = macro.dailyLimit > 0 ? Math.min(macro.value / macro.dailyLimit, 1) : 0;
  const barW = Math.max(pct * 100, 4);

  return (
    <View
      style={[
        styles.macroCard,
        {
          backgroundColor: macro.bgTint,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.macroIconWrap,
          { backgroundColor: macro.color, borderColor: theme.colors.border },
        ]}
      >
        <Ionicons name={macro.icon} size={18} color="#FFFFFF" />
      </View>

      {/* Value */}
      <Text
        style={[
          styles.macroValue,
          { color: macro.color, fontFamily: theme.fontFamilies.heading },
        ]}
      >
        {macro.value}
        <Text style={styles.macroUnit}> {macro.unit}</Text>
      </Text>

      {/* Label */}
      <Text
        style={[
          styles.macroLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamilies.body,
          },
        ]}
      >
        {macro.label}
      </Text>

      {/* Progress bar */}
      <View
        style={[
          styles.macroBarTrack,
          {
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.macroBarFill,
            {
              width: `${barW}%`,
              backgroundColor: macro.color,
            },
          ]}
        />
      </View>

      {/* Limit text */}
      <Text style={[styles.macroLimit, { color: theme.colors.textTertiary }]}>
        of {macro.dailyLimit} {macro.unit}
      </Text>
    </View>
  );
}

/** Enhanced nutrient row with color-coded bar */
function NutrientRow({ item, theme }: { item: NutrientInfo; theme: any }) {
  const ratio = item.dailyLimit > 0 ? item.value / item.dailyLimit : 0;
  const barPct = Math.min(ratio * 100, 100);
  const barColor = item.overLimit
    ? '#E05A4A'
    : ratio > 0.7
      ? '#E8A838'
      : '#00897B';

  return (
    <View style={styles.nutrientItem}>
      {/* Top row: label + values */}
      <View style={styles.nutrientTop}>
        <View style={styles.nutrientLabelRow}>
          {item.overLimit && (
            <Ionicons
              name="alert-circle"
              size={14}
              color="#E05A4A"
              style={{ marginRight: 4 }}
            />
          )}
          <Text
            style={{
              color: item.overLimit ? '#C0392B' : theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fontFamilies.body,
            }}
          >
            {item.label}
          </Text>
        </View>
        <Text
          style={{
            color: item.overLimit ? '#C0392B' : theme.colors.textSecondary,
            fontSize: theme.fontSizes.body,
            fontWeight: theme.fontWeights.semibold,
            fontFamily: theme.fontFamilies.body,
          }}
        >
          {item.value} {item.unit}
        </Text>
      </View>

      {/* Bar */}
      <View
        style={[
          styles.nutrientBarTrack,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.nutrientBarFill,
            {
              width: `${barPct}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {/* Bottom: daily limit + warning */}
      <View style={styles.nutrientBottom}>
        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.xs,
            fontFamily: theme.fontFamilies.body,
          }}
        >
          Daily limit: {item.dailyLimit} {item.unit}
        </Text>
        {item.warning && (
          <Text
            style={{
              color: item.overLimit ? '#C0392B' : '#946200',
              fontSize: theme.fontSizes.xs,
              fontFamily: theme.fontFamilies.body,
              flex: 1,
              textAlign: 'right',
              marginLeft: 8,
            }}
            numberOfLines={2}
          >
            {item.warning}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────

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
    scanLogId?: string;
  }>();
  const [isSaving, setIsSaving] = useState(false);
  const [logError, setLogError] = useState('');
  const [logged, setLogged] = useState(false);
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [historicalResult, setHistoricalResult] = useState<ScanResultData | null>(null);
  const [historicalImageUrl, setHistoricalImageUrl] = useState<string | undefined>(undefined);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  const foodNameParam = Array.isArray(params.foodName)
    ? params.foodName[0]
    : params.foodName;
  const mealTypeParam = Array.isArray(params.mealType)
    ? params.mealType[0]
    : params.mealType;
  const sourceParam = Array.isArray(params.source)
    ? params.source[0]
    : params.source;
  const imageUriParam = Array.isArray(params.imageUri)
    ? params.imageUri[0]
    : params.imageUri;
  const resultDataParam = Array.isArray(params.resultData)
    ? params.resultData[0]
    : params.resultData;
  const scanLogIdParam = Array.isArray(params.scanLogId)
    ? params.scanLogId[0]
    : params.scanLogId;

  const mealType = mealTypes.includes(mealTypeParam as MealType)
    ? (mealTypeParam as MealType)
    : 'snack';

  const source =
    sourceParam === 'barcode' || sourceParam === 'manual'
      ? sourceParam
      : 'photo';

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
    if (historicalResult) {
      return historicalResult;
    }
    return null;
  }, [resultDataParam, mealType, historicalResult]);

  // ── Historical scan log loading ──────────────────────────────────────
  const isHistorical = !!scanLogIdParam && !resultDataParam;

  useEffect(() => {
    if (!scanLogIdParam || resultDataParam) return;

    let isActive = true;

    const load = async () => {
      setHistoricalLoading(true);
      setHistoricalError(null);

      try {
        const log = await getScanLogById(scanLogIdParam);
        if (!isActive) return;

        if (!log) {
          setHistoricalError('Scan log not found.');
          return;
        }

        const nutrients = (log.nutrients ?? []).map((n: any) => ({
          nutrient: n.nutrient,
          label: n.label,
          value: n.value,
          unit: n.unit,
          dailyLimit: n.dailyLimit,
          overLimit: n.overLimit ?? false,
          warning: n.warning,
        }));

        const alternatives = (log.alternatives ?? []).map((a: any) => ({
          name: a.name,
          verdict: a.verdict as Verdict,
        }));

        setHistoricalImageUrl(getResolvedImageUrl(log.image_url));
        setHistoricalResult({
          id: log.id,
          foodName: log.food_name,
          verdict: log.verdict,
          mealType: log.meal_type ?? 'snack',
          scannedAt: log.scanned_at,
          explanation: log.reason ?? '',
          nutrients,
          alternatives: alternatives.length > 0 ? alternatives : undefined,
          portionGuidance: log.portion_guidance ?? undefined,
        });
      } catch (err) {
        if (!isActive) return;
        setHistoricalError('Could not load scan details.');
        console.error('Historical load error:', err);
      } finally {
        if (isActive) setHistoricalLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, [scanLogIdParam, resultDataParam]);

  // ── Auto-save invalid scans to persist in history ──────────────────

  useEffect(() => {
    if (!result || result.verdict !== 'invalid' || !user || isHistorical || logged) return;

    let isActive = true;
    const save = async () => {
      setIsSaving(true);
      try {
        let imageUrl: string | undefined;
        if (imageUriParam) {
          imageUrl = await uploadScanImage(user.id, imageUriParam);
        }
        await insertScanLog(user.id, result, source, imageUrl);
        if (isActive) setLogged(true);
      } catch (err) {
        console.error('Failed to auto-save invalid scan:', err);
      } finally {
        if (isActive) setIsSaving(false);
      }
    };
    save();
    return () => { isActive = false; };
  }, [result, user, isHistorical]);

  const historicalImageSource = isHistorical ? historicalImageUrl : undefined;
  const hasImage = (source === 'photo' && imageUriParam) || !!historicalImageSource;

  // ── Derive macros from nutrients ──────────────────────────────────

  const macros: MacroDatum[] = useMemo(() => {
    if (!result) return [];
    const macroKeys = ['calories', 'protein', 'carbohydrates', 'saturated_fat'];
    return macroKeys
      .map((key) => {
        const n = result.nutrients.find(
          (nut) => nut.nutrient === key,
        );
        if (!n) return null;
        const cfg = MACRO_COLORS[key as keyof typeof MACRO_COLORS];
        return {
          key,
          label: MACRO_LABELS[key] ?? n.label,
          value: n.value,
          dailyLimit: n.dailyLimit,
          unit: n.unit,
          color: cfg?.color ?? theme.colors.primary,
          bgTint: cfg?.bg ?? theme.colors.surfaceSecondary,
          icon: cfg?.icon ?? ('nutrition-outline' as const),
        };
      })
      .filter(Boolean) as MacroDatum[];
  }, [result, theme]);

  // ── Nutrients: flagged first, then rest ───────────────────────────

  const flaggedNutrients = result
    ? result.nutrients.filter((n) => n.overLimit || n.warning)
    : [];
  const safeNutrients = result
    ? result.nutrients.filter((n) => !n.overLimit && !n.warning)
    : [];
  const displayNutrients =
    showAllNutrients || flaggedNutrients.length === 0
      ? result?.nutrients ?? []
      : flaggedNutrients;

  const hiddenCount = safeNutrients.length;

  // ── No-result / historical fallback ──────────────────────────────────

  if (!result) {
    return (
      <AppScreen>
        <TopBar
          title="Scan Result"
          showBack
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)');
          }}
        />
        <View style={styles.fallbackWrap}>
          {historicalLoading ? (
            <>
              <View style={[styles.fallbackLoader, { borderColor: theme.colors.border }]}>
                <Ionicons name="hourglass-outline" size={36} color={theme.colors.primary} />
              </View>
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: theme.fontWeights.bold,
                  fontFamily: theme.fontFamilies.heading,
                  textAlign: 'center',
                  marginTop: 16,
                }}
              >
                Loading scan details...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name={historicalError ? 'cloud-offline-outline' : 'cloud-offline-outline'}
                size={56}
                color={theme.colors.caution.icon}
              />
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: theme.fontWeights.bold,
                  fontFamily: theme.fontFamilies.heading,
                  textAlign: 'center',
                  marginTop: 16,
                }}
              >
                {historicalError || 'No scan data available'}
              </Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.body,
                  fontFamily: theme.fontFamilies.body,
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                {historicalError
                  ? 'This scan log could not be found.'
                  : 'The scan analysis result was not received. Please try scanning again.'}
              </Text>
            </>
          )}
          {!historicalLoading && (
            <PrimaryButton
              label="Go to Scan"
              onPress={() => router.replace('/(tabs)/scan')}
              style={{ marginTop: 24 }}
            />
          )}
        </View>
      </AppScreen>
    );
  }

  // ── Log handler ───────────────────────────────────────────────────

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

  // ── Main render ───────────────────────────────────────────────────

  const verdictColor =
    result.verdict === 'avoid'
      ? '#C0392B'
      : result.verdict === 'caution'
        ? '#946200'
        : result.verdict === 'invalid'
          ? '#6B7280'
          : '#1B7A3D';
  const verdictBg =
    result.verdict === 'avoid'
      ? '#FFF0EE'
      : result.verdict === 'caution'
        ? '#FFF7E6'
        : result.verdict === 'invalid'
          ? '#F3F4F6'
          : '#E8F8EE';
  const verdictIcon =
    result.verdict === 'avoid'
      ? 'close-circle'
      : result.verdict === 'caution'
        ? 'warning'
        : result.verdict === 'invalid'
          ? 'help-circle-outline'
          : 'checkmark-circle';

  return (
    <AppScreen scroll noPadding>
      <TopBar
        title="Scan Result"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 48 }}>

        {/* ═══ Hero Image ═══════════════════════════════════════ */}
        {hasImage && (
          <View
            style={[
              styles.heroWrap,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <Image
              source={{ uri: imageUriParam ?? historicalImageSource }}
              style={styles.heroImg}
              contentFit="cover"
            />
            {/* Bottom gradient overlay */}
            <View style={styles.heroGradient} pointerEvents="none" />
          </View>
        )}

        {/* ═══ Food Header ══════════════════════════════════════ */}
        <View
          style={[
            styles.foodHeader,
            !hasImage && { marginTop: 12 },
          ]}
        >
          <View style={styles.foodNameRow}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes['3xl'],
                fontWeight: theme.fontWeights.bold,
                fontFamily: theme.fontFamilies.heading,
                flex: 1,
              }}
              numberOfLines={2}
            >
              {result.foodName}
            </Text>
            <ConfidenceBadge confidence={result.confidence} theme={theme} />
          </View>

          {/* Time + Verdict */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.textTertiary}
              />
              <Text
                style={{
                  color: theme.colors.textTertiary,
                  fontSize: theme.fontSizes.sm,
                  fontFamily: theme.fontFamilies.body,
                  marginLeft: 4,
                }}
              >
                {new Date(result.scannedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <VerdictBadge verdict={result.verdict} />
          </View>
        </View>

        {/* ═══ Verdict Card ═════════════════════════════════════ */}
        <View
          style={[
            styles.verdictCard,
            {
              backgroundColor: verdictBg,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          {/* Verdict header row */}
          <View style={styles.verdictHeader}>
            <View
              style={[styles.verdictIconWrap, { backgroundColor: verdictColor }]}
            >
              <Ionicons name={verdictIcon} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.verdictTitleWrap}>
              <Text
                style={{
                  color: verdictColor,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: theme.fontWeights.bold,
                  fontFamily: theme.fontFamilies.heading,
                }}
              >
                {result.verdict === 'avoid'
                  ? 'Not Recommended'
                  : result.verdict === 'caution'
                    ? 'Use With Caution'
                    : result.verdict === 'invalid'
                      ? 'Not Edible'
                      : 'Good Choice'}
              </Text>
            </View>
          </View>

          {/* Explanation */}
          <Text
            style={{
              color: verdictColor,
              fontSize: theme.fontSizes.body,
              fontFamily: theme.fontFamilies.body,
              lineHeight: theme.lineHeights.body,
              marginTop: 16,
              opacity: 0.85,
            }}
          >
            {result.explanation}
          </Text>

          {/* Safe message (safe verdict only) */}
          {result.verdict === 'safe' && result.safeMessage && (
            <View style={[styles.safeMsg, { borderTopColor: 'rgba(0,0,0,0.08)' }]}>
              <Ionicons name="sparkles" size={14} color={verdictColor} />
              <Text
                style={{
                  color: verdictColor,
                  fontSize: theme.fontSizes.sm,
                  fontFamily: theme.fontFamilies.body,
                  fontWeight: theme.fontWeights.medium,
                  marginLeft: 6,
                  flex: 1,
                }}
              >
                {result.safeMessage}
              </Text>
            </View>
          )}

          {/* Portion guidance */}
          {result.verdict !== 'invalid' && result.portionGuidance && (
            <View style={[styles.portionRow, { borderTopColor: 'rgba(0,0,0,0.08)' }]}>
              <Ionicons
                name="restaurant-outline"
                size={14}
                color={verdictColor}
              />
              <Text
                style={{
                  color: verdictColor,
                  fontSize: theme.fontSizes.xs,
                  fontFamily: theme.fontFamilies.body,
                  fontStyle: 'italic',
                  marginLeft: 6,
                  flex: 1,
                }}
              >
                {result.portionGuidance}
              </Text>
            </View>
          )}
        </View>

        {/* ═══ Macro Visualization ═══════════════════════════════ */}
        {result.verdict !== 'invalid' && macros.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fontFamilies.heading,
                },
              ]}
            >
              Macro Breakdown
            </Text>
            <View style={styles.macroGrid}>
              {macros.map((m) => (
                <MacroCard key={m.key} macro={m} theme={theme} />
              ))}
            </View>
          </>
        )}

        {/* ═══ Nutrient Details ═════════════════════════════════ */}
        {result.verdict !== 'invalid' && (
        <>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.fontFamilies.heading,
            },
          ]}
        >
          {flaggedNutrients.length > 0
            ? 'Nutrients to Watch'
            : 'Nutrition Facts'}
        </Text>
        <Card>
          {displayNutrients.map((n, i) => (
            <React.Fragment key={`${n.nutrient}-${i}`}>
              {i > 0 && (
                <View
                  style={[
                    styles.nutrientDivider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
              <NutrientRow item={n} theme={theme} />
            </React.Fragment>
          ))}

          {/* Show all toggle */}
          {!showAllNutrients && hiddenCount > 0 && flaggedNutrients.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowAllNutrients(true)}
              style={styles.showMore}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.fontSizes.sm,
                  fontWeight: theme.fontWeights.medium,
                  fontFamily: theme.fontFamilies.body,
                }}
              >
                Show all {result.nutrients.length} nutrients
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </Card>
        </>
        )}

        {/* ═══ Better Alternatives ═══════════════════════════════ */}
        {result.verdict !== 'invalid' && result.alternatives && result.alternatives.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fontFamilies.heading,
                },
              ]}
            >
              Better Alternatives
            </Text>
            <Card noPadding>
              {result.alternatives.map((alt, idx) => (
                <View
                  key={alt.name}
                  style={[
                    styles.altRow,
                    idx < result.alternatives!.length - 1 && {
                      borderBottomWidth: 2,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.altIconWrap,
                      {
                        backgroundColor:
                          alt.verdict === 'safe'
                            ? theme.colors.safe.bg
                            : alt.verdict === 'caution'
                              ? theme.colors.caution.bg
                              : theme.colors.avoid.bg,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={16}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: theme.fontSizes.body,
                      fontFamily: theme.fontFamilies.body,
                      flex: 1,
                      marginLeft: 10,
                    }}
                  >
                    {alt.name}
                  </Text>
                  <VerdictBadge verdict={alt.verdict} />
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ═══ Actions ═══════════════════════════════════════════ */}
        <View style={styles.actions}>
          {result.verdict === 'invalid' ? (
            <>
              <View
                style={[
                  styles.logErr,
                  {
                    backgroundColor: theme.colors.invalid.bg,
                    borderColor: theme.colors.invalid.border,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={theme.colors.invalid.icon}
                />
                <Text
                  style={{
                    color: theme.colors.invalid.text,
                    fontSize: theme.fontSizes.sm,
                    fontFamily: theme.fontFamilies.body,
                    marginLeft: 6,
                    flex: 1,
                  }}
                >
                  This item was identified as non-edible and won't be added to your daily intake.
                </Text>
              </View>
              <SecondaryButton
                label="Scan Another"
                onPress={() => router.replace('/(tabs)/scan')}
                style={{ marginTop: 10 }}
                icon={
                  <Ionicons name="scan" size={18} color={theme.colors.primary} />
                }
              />
            </>
          ) : !isHistorical ? (
            <>
              {!logged ? (
                <>
                  {logError ? (
                    <View
                      style={[
                        styles.logErr,
                        {
                          backgroundColor: theme.colors.avoid.bg,
                          borderColor: theme.colors.border,
                          borderRadius: theme.radius.sm,
                        },
                      ]}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={16}
                        color={theme.colors.avoid.icon}
                      />
                      <Text
                        style={{
                          color: theme.colors.avoid.text,
                          fontSize: theme.fontSizes.sm,
                          fontFamily: theme.fontFamilies.body,
                          marginLeft: 6,
                        }}
                      >
                        {logError}
                      </Text>
                    </View>
                  ) : null}
                  <PrimaryButton
                    label="Add to Food Log"
                    onPress={handleLog}
                    icon={
                      <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    }
                    loading={isSaving}
                  />
                </>
              ) : (
                <View
                  style={[
                    styles.loggedBanner,
                    {
                      backgroundColor: theme.colors.safe.bg,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={28}
                    color={theme.colors.safe.icon}
                  />
                  <Text
                    style={{
                      color: theme.colors.safe.text,
                      fontSize: theme.fontSizes.body,
                      fontWeight: theme.fontWeights.semibold,
                      fontFamily: theme.fontFamilies.body,
                      marginLeft: 10,
                    }}
                  >
                    Added to your food log!
                  </Text>
                </View>
              )}

              <SecondaryButton
                label="Scan Another"
                onPress={() => router.replace('/(tabs)/scan')}
                style={{ marginTop: 10 }}
                icon={
                  <Ionicons name="scan" size={18} color={theme.colors.primary} />
                }
              />
            </>
          ) : null}
        </View>
      </View>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Fallback
  fallbackWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fallbackLoader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero image
  heroWrap: {
    marginTop: 12,
    height: 220,
    overflow: 'hidden',
    borderWidth: 3,
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },

  // Food header
  foodHeader: {
    marginTop: 16,
    marginBottom: 4,
  },
  foodNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Verdict card
  verdictCard: {
    borderWidth: 3,
    padding: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  verdictIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verdictTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safeMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },

  // Macro grid
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroCard: {
    width: '47.5%',
    borderWidth: 3,
    padding: 14,
    alignItems: 'center',
    flexGrow: 1,
    flexBasis: '45%',
  },
  macroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  macroUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  macroBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroLimit: {
    fontSize: 10,
    marginTop: 4,
  },

  // Nutrient rows
  nutrientItem: {
    paddingVertical: 10,
  },
  nutrientTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutrientBarTrack: {
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    overflow: 'hidden',
  },
  nutrientBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  nutrientBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  nutrientDivider: {
    height: 2,
  },
  showMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    gap: 4,
  },

  // Alternatives
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  altIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  // Actions
  actions: {
    marginTop: 28,
  },
  logErr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 2,
  },
  loggedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 18,
  },
});
