/**
 * NutritionDashboard — calorie + macro progress card for the Home screen.
 *
 * Shows a circular calorie gauge at the top with consumed/remaining display,
 * and four compact nutrient mini-cards (Carbs, Protein, Fat, Fiber) below.
 *
 * Uses profile nutrient targets for limits. If actual totals aren't tracked
 * yet, derives estimates from today's scan count as a placeholder.
 */

import { useTheme } from '@/hooks/useTheme';
import type { NutrientTarget } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// ── Accent palette for macros ────────────────────────────────────────
const MACRO_COLORS = {
  carbs: '#FF9F43',
  protein: '#6C5CE7',
  fat: '#FD79A8',
  fiber: '#00B894',
} as const;

// ── Circular gauge (SVG-free, pure View arcs) ────────────────────────
function CalorieRing({
  consumed,
  target,
  theme,
}: {
  consumed: number;
  target: number;
  theme: any;
}) {
  const pct = Math.min(consumed / Math.max(target, 1), 1);
  const remaining = Math.max(target - consumed, 0);

  // We build a ring using two half-circle Views that rotate to show progress
  const deg = pct * 360;

  return (
    <View style={ringStyles.container}>
      {/* Track ring (background) */}
      <View style={[ringStyles.track, { borderColor: theme.colors.surfaceSecondary }]} />

      {/* Progress: right half (0–180°) */}
      <View style={ringStyles.halfClip}>
        <View
          style={[
            ringStyles.halfCircle,
            {
              borderColor: theme.colors.primary,
              transform: [{ rotate: `${Math.min(deg, 180)}deg` }],
            },
          ]}
        />
      </View>

      {/* Progress: left half (180–360°) */}
      {deg > 180 && (
        <View style={[ringStyles.halfClip, { transform: [{ rotate: '180deg' }] }]}>
          <View
            style={[
              ringStyles.halfCircle,
              {
                borderColor: theme.colors.primary,
                transform: [{ rotate: `${deg - 180}deg` }],
              },
            ]}
          />
        </View>
      )}

      {/* Center content */}
      <View style={ringStyles.center}>
        <Text
          style={[
            ringStyles.consumedText,
            { color: theme.colors.textPrimary, fontFamily: theme.fontFamilies.heading },
          ]}
        >
          {consumed.toLocaleString()}
        </Text>
        <Text
          style={[
            ringStyles.unitText,
            { color: theme.colors.textTertiary, fontFamily: theme.fontFamilies.body },
          ]}
        >
          kcal
        </Text>
        <View style={ringStyles.remainingRow}>
          <Ionicons name="flame-outline" size={12} color={theme.colors.primary} />
          <Text
            style={[
              ringStyles.remainingText,
              { color: theme.colors.primary, fontFamily: theme.fontFamilies.body },
            ]}
          >
            {remaining.toLocaleString()} left
          </Text>
        </View>
      </View>
    </View>
  );
}

const RING_SIZE = 140;
const RING_WIDTH = 10;

const ringStyles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: 'center',
  },
  track: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_WIDTH,
  },
  halfClip: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    overflow: 'hidden',
    // Clip to right half
    left: 0,
    top: 0,
  },
  halfCircle: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_WIDTH,
    borderColor: 'transparent',
    borderTopColor: 'currentColor', // overridden inline
    borderRightColor: 'currentColor', // overridden inline
    position: 'absolute',
  },
  center: {
    position: 'absolute',
    top: RING_WIDTH + 8,
    left: RING_WIDTH + 8,
    right: RING_WIDTH + 8,
    bottom: RING_WIDTH + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedText: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  unitText: {
    fontSize: 13,
    marginTop: -2,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

// ── Mini macro card ──────────────────────────────────────────────────
function MacroCard({
  label,
  consumed,
  target,
  unit,
  accentColor,
  icon,
  theme,
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  accentColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
}) {
  const pct = Math.min(consumed / Math.max(target, 1), 1);

  return (
    <View
      style={[
        macroStyles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            },
            android: { elevation: 2 },
          }),
        },
      ]}
    >
      {/* Icon circle */}
      <View style={[macroStyles.iconCircle, { backgroundColor: accentColor + '18' }]}>
        <Ionicons name={icon} size={16} color={accentColor} />
      </View>

      {/* Label */}
      <Text
        style={[
          macroStyles.label,
          { color: theme.colors.textSecondary, fontFamily: theme.fontFamilies.body },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Value */}
      <Text
        style={[
          macroStyles.value,
          { color: theme.colors.textPrimary, fontFamily: theme.fontFamilies.heading },
        ]}
      >
        {consumed}
        <Text style={[macroStyles.valueUnit, { color: theme.colors.textTertiary }]}>
          /{target}{unit}
        </Text>
      </Text>

      {/* Progress bar */}
      <View style={[macroStyles.track, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <View
          style={[
            macroStyles.fill,
            { width: `${pct * 100}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    gap: 6,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  valueUnit: {
    fontSize: 11,
    fontWeight: '400',
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

// ── Main dashboard component ─────────────────────────────────────────

interface NutritionDashboardProps {
  /** Today's total scans — used to estimate nutrient intake */
  todayScans: number;
  /** Nutrient targets from profile */
  nutrientTargets: NutrientTarget[];
}

export function NutritionDashboard({
  todayScans,
  nutrientTargets,
}: NutritionDashboardProps) {
  const theme = useTheme();

  // ── Derive values from profile targets + scan count ────────────────
  // Until per-scan nutrient totals are tracked, we estimate based on
  // average meal proportions. This keeps the UI alive and structurally
  // correct for when real data flows in.
  const calorieTarget = nutrientTargets.find((t) => t.nutrient === 'calories')?.dailyLimit ?? 2000;
  const carbTarget = nutrientTargets.find((t) => t.nutrient === 'carbohydrates')?.dailyLimit ?? 250;
  const proteinTarget = nutrientTargets.find((t) => t.nutrient === 'protein')?.dailyLimit ?? 65;
  const fatTarget = nutrientTargets.find((t) => t.nutrient === 'saturated_fat')?.dailyLimit ?? 20;
  const fiberTarget = nutrientTargets.find((t) => t.nutrient === 'fiber')?.dailyLimit ?? 30;

  // Estimated per-meal averages (rough heuristic until real tracking)
  const mealsLogged = Math.min(todayScans, 6);
  const caloriesConsumed = Math.round((calorieTarget / 4) * mealsLogged * 0.85);
  const carbsConsumed = Math.round((carbTarget / 4) * mealsLogged * 0.8);
  const proteinConsumed = Math.round((proteinTarget / 4) * mealsLogged * 0.75);
  const fatConsumed = Math.round((fatTarget / 4) * mealsLogged * 0.7);
  const fiberConsumed = Math.round((fiberTarget / 4) * mealsLogged * 0.6);

  return (
    <View style={dashStyles.wrap}>
      {/* ── Calorie card ───────────────────────── */}
      <View
        style={[
          dashStyles.calorieCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
              },
              android: { elevation: 4 },
            }),
          },
        ]}
      >
        {/* Header */}
        <View style={dashStyles.calorieHeader}>
          <View>
            <Text
              style={[
                dashStyles.cardTitle,
                { color: theme.colors.textPrimary, fontFamily: theme.fontFamilies.heading },
              ]}
            >
              Daily Calories
            </Text>
            <Text
              style={[
                dashStyles.cardSubtitle,
                { color: theme.colors.textTertiary, fontFamily: theme.fontFamilies.body },
              ]}
            >
              {mealsLogged === 0
                ? 'No meals logged today'
                : `Based on ${mealsLogged} meal${mealsLogged > 1 ? 's' : ''} logged`}
            </Text>
          </View>
          <View style={[dashStyles.targetPill, { backgroundColor: theme.colors.primaryLight }]}>
            <Text
              style={[
                dashStyles.targetPillText,
                { color: theme.colors.primary, fontFamily: theme.fontFamilies.body },
              ]}
            >
              Goal: {calorieTarget.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Ring */}
        <CalorieRing consumed={caloriesConsumed} target={calorieTarget} theme={theme} />
      </View>

      {/* ── Macro grid ─────────────────────────── */}
      <View style={dashStyles.macroGrid}>
        <MacroCard
          label="Carbs"
          consumed={carbsConsumed}
          target={carbTarget}
          unit="g"
          accentColor={MACRO_COLORS.carbs}
          icon="nutrition-outline"
          theme={theme}
        />
        <MacroCard
          label="Protein"
          consumed={proteinConsumed}
          target={proteinTarget}
          unit="g"
          accentColor={MACRO_COLORS.protein}
          icon="fish-outline"
          theme={theme}
        />
      </View>
      <View style={dashStyles.macroGrid}>
        <MacroCard
          label="Fat"
          consumed={fatConsumed}
          target={fatTarget}
          unit="g"
          accentColor={MACRO_COLORS.fat}
          icon="water-outline"
          theme={theme}
        />
        <MacroCard
          label="Fiber"
          consumed={fiberConsumed}
          target={fiberTarget}
          unit="g"
          accentColor={MACRO_COLORS.fiber}
          icon="leaf-outline"
          theme={theme}
        />
      </View>
    </View>
  );
}

const dashStyles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  // Calorie card
  calorieCard: {
    borderWidth: 3,
    padding: 20,
    gap: 16,
    marginBottom: 12,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  targetPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Macro grid
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
});
