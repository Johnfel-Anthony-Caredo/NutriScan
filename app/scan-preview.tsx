/**
 * Scan Preview — analyzing screen with hero image + bottom sheet result panel.
 *
 * Shows captured image at top with a bottom panel. While AI analysis runs,
 * the panel shows rotating status text + shimmer skeleton. On completion,
 * the panel transitions in-place to show the full scan result (no navigation).
 */

import { AppScreen, PrimaryButton, SecondaryButton, VerdictBadge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import type { ScanResultData } from '@/data/mockData';
import { useTheme } from '@/hooks/useTheme';
import { analyzeBarcodeWithAi, analyzeFoodPhoto, analyzeTextFood, buildScanResultFromAiResponse, buildScanResultFromBarcode, lookupBarcode, type BarcodeProductData } from '@/services/scanService';
import { uploadScanImage } from '@/services/storageService';
import { insertScanLog } from '@/services/supabaseService';
import { optimizeImageForUpload } from '@/utils/optimizeImage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HERO_HEIGHT = SCREEN_HEIGHT * 0.42;
const BOTTOM_RADIUS = 28;

const STATUS_PHRASES = [
  'Analyzing',
  'Scanning',
  'Reading nutrients',
  'Checking ingredients',
  'Preparing result',
];

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** Renders a small confidence indicator next to the food name */
function ConfidenceBadge({ confidence, theme }: { confidence?: number; theme: any }) {
  if (confidence === undefined) return null;

  const isHigh = confidence >= 0.8;
  const isMedium = confidence >= 0.5 && confidence < 0.8;
  const bgColor = isHigh ? '#E8F5E9' : isMedium ? '#FFF8E1' : '#FFEBEE';
  const textColor = isHigh ? '#2E7D32' : isMedium ? '#F57F17' : '#C62828';
  const icon = isHigh ? 'checkmark-circle' : isMedium ? 'help-circle' : 'alert-circle';

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: bgColor,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginTop: 4,
      alignSelf: 'flex-start',
    }}>
      <Ionicons name={icon} size={14} color={textColor} />
      <Text style={{
        color: textColor,
        fontSize: 11,
        fontWeight: '600',
        fontFamily: theme.fontFamilies?.body,
        marginLeft: 4,
      }}>
        {isHigh ? 'Identified' : `${Math.round(confidence * 100)}% confident`}
      </Text>
    </View>
  );
}

/** Renders portion guidance as a small inline note in the explanation card */
function PortionGuidanceNote({ text, theme }: { text?: string; theme: any }) {
  if (!text) return null;
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors?.border || 'rgba(0,0,0,0.08)',
    }}>
      <Ionicons name="restaurant-outline" size={16} color={theme.colors?.textTertiary || '#999'} />
      <Text style={{
        color: theme.colors?.textTertiary || '#999',
        fontSize: theme.fontSizes?.xs || 12,
        fontFamily: theme.fontFamilies?.body,
        marginLeft: 6,
        flex: 1,
        fontStyle: 'italic',
      }}>
        {text}
      </Text>
    </View>
  );
}

export default function ScanPreviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ source?: string; uri?: string; data?: string; foodName?: string }>();
  const sourceParam = Array.isArray(params.source) ? params.source[0] : params.source;
  const uriParam = Array.isArray(params.uri) ? params.uri[0] : params.uri;
  const dataParam = Array.isArray(params.data) ? params.data[0] : params.data;
  const foodNameParam = Array.isArray(params.foodName) ? params.foodName[0] : params.foodName;

  const source = sourceParam === 'barcode' ? 'barcode' : sourceParam === 'manual' ? 'manual' : 'photo';

  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Result state — filled after analysis completes
  const [result, setResult] = useState<ScanResultData | null>(null);

  // Logging state
  const [isSaving, setIsSaving] = useState(false);
  const [logError, setLogError] = useState('');
  const [logged, setLogged] = useState(false);

  // Hardcoded meal type — no visible selector
  const mealType: MealType = 'snack';

  // Internal food name for API calls
  const [foodName] = useState(
    source === 'barcode' && dataParam ? `Barcode: ${dataParam}`
    : source === 'manual' && foodNameParam ? foodNameParam
    : 'Detected Food Item',
  );

  // ── Rotating status text ──
  useEffect(() => {
    if (result) return; // Stop rotating once result is ready

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setStatusIndex((prev) => (prev + 1) % STATUS_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [fadeAnim, result]);

  // ── Auto-start analysis on mount ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isActive = true;

    const runAnalysis = async () => {
      // For barcode source: lookup Open Food Facts first
      let barcodeData: BarcodeProductData | null = null;

      if (source === 'barcode' && dataParam) {
        try {
          barcodeData = await lookupBarcode(dataParam);
        } catch {
          // Continue with limited data
        }
      }

      if (!isActive) return;

      try {
        let scanResult: ScanResultData;

        if (source === 'barcode') {
          if (barcodeData && Object.keys(barcodeData.nutrients).length > 2) {
            scanResult = buildScanResultFromBarcode(barcodeData, mealType);
            if (scanResult.nutrients.length < 3) {
              try {
                const aiResponse = await analyzeBarcodeWithAi(barcodeData, {
                  conditions: profile.conditions,
                  goals: profile.goals,
                  nutrientTargets: profile.nutrientTargets,
                });
                scanResult = buildScanResultFromAiResponse(aiResponse, mealType, source);
              } catch {
                // Use direct barcode data as fallback
              }
            }
          } else {
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
            scanResult = buildScanResultFromAiResponse(aiResponse, mealType, source);
          }
        } else if (source === 'manual') {
          const aiResponse = await analyzeTextFood(foodName, {
            conditions: profile.conditions,
            goals: profile.goals,
            nutrientTargets: profile.nutrientTargets,
          });
          scanResult = buildScanResultFromAiResponse(aiResponse, mealType, 'manual');
        } else {
          const { base64, mimeType } = await optimizeImageForUpload(uriParam!, {
            maxWidth: 1200,
            compress: 0.6,
          });

          const aiResponse = await analyzeFoodPhoto(base64, mimeType, {
            conditions: profile.conditions,
            goals: profile.goals,
            nutrientTargets: profile.nutrientTargets,
          }, barcodeData);
          scanResult = buildScanResultFromAiResponse(aiResponse, mealType, 'photo');
        }

        if (!isActive) return;

        setResult(scanResult);

        // Auto-save invalid scans so they appear in history
        if (scanResult.verdict === 'invalid' && user) {
          try {
            let imgUrl: string | undefined;
            if (uriParam) {
              imgUrl = await uploadScanImage(user.id, uriParam);
            }
            await insertScanLog(user.id, scanResult, source, imgUrl);
          } catch {
            // Silently fail — scan still shown to user
          }
        }
      } catch (err: any) {
        if (!isActive) return;
        console.error('Analysis failed:', err);
        setError(err.message || 'Analysis failed. Please try again.');
      }
    };

    runAnalysis();
    return () => { isActive = false; };
  }, []);

  const showImage = source === 'photo' && uriParam;

  // ── Log to Supabase ──
  const handleLog = async () => {
    if (!user) {
      setLogError('Please sign in to save scans.');
      return;
    }
    if (!result) return;

    setIsSaving(true);
    setLogError('');

    try {
      let imageUrl: string | undefined;

      if (uriParam) {
        imageUrl = await uploadScanImage(user.id, uriParam);
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
    <AppScreen noPadding>
      {/* ── Hero Image ─────────────────────── */}
      <View style={[styles.heroWrap, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
        {showImage ? (
          <Image source={{ uri: uriParam }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={styles.heroFallback}>
            <Ionicons name={source === 'barcode' ? 'barcode-outline' : 'image-outline'} size={56} color={theme.colors.textTertiary} />
          </View>
        )}

        {/* Top gradient overlay for readability */}
        <View style={styles.heroOverlay} pointerEvents="none" />
      </View>

      {/* ── Bottom Panel ──────────────────── */}
      <View style={[styles.bottomPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {/* Drag hint */}
        <View style={[styles.dragHint, { backgroundColor: theme.colors.textTertiary }]} />

        {!result && !error ? (
          /* ── Loading State ───────────────────── */
          <>
            {/* Status section */}
            <View style={styles.statusSection}>
              <View style={[styles.scanIcon, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
                <Ionicons name="scan" size={24} color={theme.colors.primary} />
              </View>
              <Animated.Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.xl,
                  fontWeight: theme.fontWeights.bold,
                  fontFamily: theme.fontFamilies.heading,
                  marginTop: 16,
                  opacity: fadeAnim,
                }}
              >
                {STATUS_PHRASES[statusIndex]}
              </Animated.Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.sm,
                  fontFamily: theme.fontFamilies.body,
                  marginTop: 6,
                  textAlign: 'center',
                  paddingHorizontal: 20,
                }}
              >
                {'Checking your food against your health profile'}
              </Text>
            </View>

            {/* Shimmer / Skeleton content */}
            <View style={styles.shimmerSection}>
              <ShimmerLine width="65%" theme={theme} />
              <ShimmerLine width="85%" theme={theme} />
              <ShimmerLine width="45%" theme={theme} />
              <ShimmerLine width="70%" theme={theme} />
              <ShimmerLine width="55%" theme={theme} />
              <ShimmerLine width="80%" theme={theme} last />
            </View>
          </>
        ) : error ? (
          /* ── Error State ─────────────────────── */
          <View style={styles.errorWrap}>
            <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.caution.icon} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginTop: 12 }}>
              Analysis Failed
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
              {error}
            </Text>
            <SecondaryButton
              label="Try Again"
              onPress={() => router.replace('/(tabs)/scan')}
              style={{ marginTop: 20 }}
              icon={<Ionicons name="scan" size={18} color={theme.colors.primary} />}
            />
          </View>
        ) : result ? (
          /* ── Result Content ──────────────────── */
          <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
            {/* Verdict header row */}
            <View style={styles.verdictRow}>
              <VerdictBadge verdict={result.verdict} />
              <View style={styles.verdictInfo}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading }}>
                  {result.foodName}
                </Text>
                <ConfidenceBadge confidence={result.confidence} theme={theme} />
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, marginTop: 2 }}>
                  {new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {/* Explanation card — premium treatment with verdict-tinted background */}
            {(() => {
              const isAvoid = result.verdict === 'avoid';
              const isCaution = result.verdict === 'caution';
              const isInvalid = result.verdict === 'invalid';
              const cardBg = isAvoid ? '#FDF0EE' : isCaution ? '#FDF8EE' : isInvalid ? '#F3F4F6' : '#F0F6EE';
              const textColor = isAvoid ? '#8B3A3A' : isCaution ? '#8B7A3A' : isInvalid ? '#6B7280' : '#3A7B4A';
              const accentColor = isAvoid ? '#E05A4A' : isCaution ? '#D4A830' : isInvalid ? '#9CA3AF' : '#4CAF50';
              return (
                <View style={[styles.explainCard, { backgroundColor: cardBg, borderColor: theme.colors.border }]}>
                  <View style={styles.explainBody}>
                    <View style={[styles.explainHeader, { borderBottomColor: accentColor }]}>
                      <Ionicons name={isAvoid ? 'warning' : isCaution ? 'alert-circle' : isInvalid ? 'help-circle-outline' : 'checkmark-circle'} size={18} color={accentColor} />
                      <Text style={{ color: textColor, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.heading, marginLeft: 8, letterSpacing: 0.5 }}>
                        {isAvoid ? 'NOT RECOMMENDED' : isCaution ? 'USE WITH CAUTION' : isInvalid ? 'NOT EDIBLE' : 'GOOD CHOICE'}
                      </Text>
                    </View>
                    <Text style={{ color: textColor, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, lineHeight: theme.lineHeights.body }}>
                      {result.explanation}
                    </Text>
                    {!isInvalid && <PortionGuidanceNote text={result.portionGuidance} theme={theme} />}
                    {result.verdict === 'safe' && result.safeMessage && (
                      <View style={[styles.safeRow, { borderTopColor: accentColor }]}>
                        <Ionicons name="checkmark-circle" size={16} color={accentColor} />
                        <Text style={{ color: textColor, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginLeft: 6, flex: 1 }}>
                          {result.safeMessage}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}

            {/* Nutrient summary */}
            {result.nutrients.length > 0 && (
              <NutrientSummary nutrients={result.nutrients} theme={theme} />
            )}

            {/* Better Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.heading, marginTop: 16, marginBottom: 8 }}>
                  Better Alternatives
                </Text>
                {result.alternatives.map((alt) => (
                  <View key={alt.name} style={[styles.altRow, { borderColor: theme.colors.border }]}>
                    <View style={styles.altLeft}>
                      <Ionicons name="swap-horizontal" size={16} color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, flex: 1, marginLeft: 10 }}>
                        {alt.name}
                      </Text>
                    </View>
                    <VerdictBadge verdict={alt.verdict} />
                  </View>
                ))}
              </>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {result.verdict === 'invalid' ? (
                <>
                  <View style={[styles.infoBanner, { backgroundColor: theme.colors.invalid.bg, borderColor: theme.colors.invalid.border }]}>
                    <Ionicons name="information-circle-outline" size={16} color={theme.colors.invalid.icon} />
                    <Text style={{ color: theme.colors.invalid.text, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, marginLeft: 6, flex: 1 }}>
                      This item was identified as non-edible and won't be added to your daily intake.
                    </Text>
                  </View>
                  <SecondaryButton
                    label="Scan Another"
                    onPress={() => router.replace('/(tabs)/scan')}
                    style={{ marginTop: 10 }}
                    icon={<Ionicons name="scan" size={18} color={theme.colors.primary} />}
                  />
                </>
              ) : !logged ? (
                <>
                  {logError ? (
                    <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.xs, textAlign: 'center', marginBottom: 6 }}>
                      {logError}
                    </Text>
                  ) : null}
                  <PrimaryButton
                    label="Add to Food Log"
                    onPress={handleLog}
                    icon={<Ionicons name="add-circle" size={20} color="#FFFFFF" />}
                    loading={isSaving}
                  />
                  <SecondaryButton
                    label="Scan Another"
                    onPress={() => router.replace('/(tabs)/scan')}
                    style={{ marginTop: 8 }}
                    icon={<Ionicons name="scan" size={18} color={theme.colors.primary} />}
                  />
                </>
              ) : (
                <>
                  <View style={[styles.loggedBanner, { backgroundColor: theme.colors.safe.bg, borderColor: theme.colors.border }]}>
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.safe.icon} />
                    <Text style={{ color: theme.colors.safe.text, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 6 }}>
                      Added to your food log!
                    </Text>
                  </View>
                  <SecondaryButton
                    label="Scan Another"
                    onPress={() => router.replace('/(tabs)/scan')}
                    style={{ marginTop: 8 }}
                    icon={<Ionicons name="scan" size={18} color={theme.colors.primary} />}
                  />
                </>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        ) : null}
      </View>
    </AppScreen>
  );
}

// ── Nutrient Summary Sub-component ──────────────────────────────────

function NutrientSummary({ nutrients, theme }: { nutrients: ScanResultData['nutrients']; theme: any }) {
  const [showAll, setShowAll] = useState(false);

  const flagged = nutrients.filter((n) => n.overLimit || n.warning);
  const hasFlagged = flagged.length > 0;

  const displayList = showAll ? nutrients : hasFlagged ? flagged : nutrients.slice(0, 4);

  return (
    <>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.heading, marginTop: 16, marginBottom: 8 }}>
        {hasFlagged ? 'Nutrients to Watch' : 'Nutrition Facts'}
      </Text>
      <View style={[styles.nutrientCard, { borderColor: theme.colors.border }]}>
        {displayList.map((n, i) => (
          <React.Fragment key={`${n.nutrient}-${i}`}>
            {i > 0 && <View style={[styles.nutrientDivider, { backgroundColor: theme.colors.border }]} />}
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientLabelWrap}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, fontWeight: theme.fontWeights.medium }}>
                  {n.label}
                </Text>
                {n.warning && (
                  <Ionicons name="alert-circle" size={12} color={n.overLimit ? theme.colors.avoid.icon : theme.colors.caution.icon} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={{ color: n.overLimit ? theme.colors.avoid.text : theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body, fontWeight: theme.fontWeights.semibold }}>
                {n.value}{n.unit} / {n.dailyLimit}{n.unit}
              </Text>
            </View>
            {/* Compact progress dot */}
            <View style={[styles.nutrientDotTrack, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
              <View style={[styles.nutrientDotFill, {
                width: `${Math.min((n.value / n.dailyLimit) * 100, 100)}%`,
                backgroundColor: n.overLimit ? theme.colors.avoid.icon
                  : (n.value / n.dailyLimit) > 0.7 ? theme.colors.caution.icon
                  : theme.colors.safe.icon,
              }]} />
            </View>
          </React.Fragment>
        ))}
        {!showAll && nutrients.length > displayList.length && (
          <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showMoreBtn} accessibilityRole="button">
            <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body }}>
              +{nutrients.length - displayList.length} more nutrients
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

/** Single animated shimmer line */
function ShimmerLine({ width, theme, last = false }: { width: string; theme: any; last?: boolean }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height: 14,
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: 7,
        opacity,
        marginBottom: last ? 0 : 12,
      }}
    />
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 0,
    borderWidth: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  bottomPanel: {
    flex: 1,
    marginTop: -BOTTOM_RADIUS,
    borderTopLeftRadius: BOTTOM_RADIUS,
    borderTopRightRadius: BOTTOM_RADIUS,
    borderWidth: 3,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  dragHint: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  scanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  shimmerSection: {
    width: '100%',
    paddingHorizontal: 8,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  resultScroll: {
    flex: 1,
    width: '100%',
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  verdictInfo: {
    flex: 1,
    marginLeft: 12,
  },
  explainCard: {
    borderWidth: 3,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  explainBody: {
    padding: 16,
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 12,
  },
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  nutrientCard: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nutrientLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutrientDivider: {
    height: 2,
    marginBottom: 10,
    marginTop: 2,
  },
  nutrientDotTrack: {
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  nutrientDotFill: {
    height: 2,
    marginTop: 0,
    marginLeft: 0,
    borderRadius: 1,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    gap: 4,
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 3,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  altLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  actions: {
    width: '100%',
    marginTop: 20,
  },
  loggedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 14,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderRadius: 10,
  },
});
