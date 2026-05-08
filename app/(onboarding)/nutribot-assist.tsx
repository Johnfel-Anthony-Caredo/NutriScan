/**
 * NutriBot Assist Screen — Step 4 (Conditional).
 *
 * Only shown when the user selected "I'm not sure" in Step 2.
 * Asks 3–5 short health-related questions to classify the user
 * into the best matching in-app condition category.
 * The user must confirm the suggested category before continuing.
 */

import { AppScreen, Card, ConditionPill, PrimaryButton, SecondaryButton } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { conditionLabels, type HealthCondition } from '@/types/health';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Question {
  id: number;
  text: string;
  options: { label: string; conditions: HealthCondition[] }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Which of these concerns you most about your diet?',
    options: [
      { label: 'Blood sugar spikes / energy crashes after eating', conditions: ['diabetes'] },
      { label: 'High blood pressure or salty foods', conditions: ['hypertension'] },
      { label: 'Cholesterol or heart health', conditions: ['heart_disease'] },
      { label: 'Kidney function or fluid retention', conditions: ['kidney_disease'] },
      { label: 'Liver health or fatty foods', conditions: ['liver_disease'] },
      { label: 'General health / weight management', conditions: ['other'] },
    ],
  },
  {
    id: 2,
    text: 'Has a doctor or health professional mentioned any of these?',
    options: [
      { label: 'Watch your sugar / carb intake', conditions: ['diabetes'] },
      { label: 'Reduce salt / sodium', conditions: ['hypertension'] },
      { label: 'Lower cholesterol / saturated fat', conditions: ['heart_disease'] },
      { label: 'Monitor potassium / phosphorus', conditions: ['kidney_disease'] },
      { label: 'Reduce fatty / processed foods', conditions: ['liver_disease'] },
      { label: "Haven't discussed diet with a doctor", conditions: ['unsure'] },
    ],
  },
  {
    id: 3,
    text: 'What type of food guidance would help you most?',
    options: [
      { label: 'Which foods raise my blood sugar', conditions: ['diabetes'] },
      { label: 'Low-sodium meal ideas', conditions: ['hypertension'] },
      { label: 'Heart-healthy alternatives', conditions: ['heart_disease'] },
      { label: 'Kidney-friendly food choices', conditions: ['kidney_disease'] },
      { label: 'Low-fat / liver-friendly options', conditions: ['liver_disease'] },
      { label: 'General healthy eating tips', conditions: ['other'] },
    ],
  },
];

type AnswerMap = Record<number, HealthCondition[]>;

function tallyAnswers(answers: AnswerMap): HealthCondition | 'other' {
  const counts: Record<string, number> = {};
  Object.values(answers).forEach((conditions) => {
    conditions.forEach((c) => {
      counts[c] = (counts[c] || 0) + 1;
    });
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0 || sorted[0][1] === 0) return 'other';

  const top = sorted[0][0] as HealthCondition;
  if (top === 'unsure' || top === 'other') return 'other';
  return top;
}

export default function NutriBotAssistScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setPrimaryCondition, setAiSuggestedCondition, profile } = useProfile();
  const [step, setStep] = useState<'questions' | 'result' | 'confirm'>('questions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const handleAnswer = (conditions: HealthCondition[]) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: conditions };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered — tally and show result
      const suggested = tallyAnswers(newAnswers);
      setAiSuggestedCondition(suggested);
      setStep('result');
    }
  };

  const handleConfirm = () => {
    if (!profile.aiSuggestedCondition) return;
    setPrimaryCondition({
      condition: profile.aiSuggestedCondition,
      source: 'unsure_ai',
    });
    router.push('/(onboarding)/goals');
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setStep('questions');
  };

  // ── Result Step ──────────────────────────────────────────────
  if (step === 'result') {
    const suggested = profile.aiSuggestedCondition;
    const label = suggested ? conditionLabels[suggested] : 'General Guidance';
    const icon = suggested === 'diabetes' ? 'water' as const
      : suggested === 'hypertension' ? 'pulse' as const
      : suggested === 'heart_disease' ? 'heart' as const
      : suggested === 'kidney_disease' ? 'fitness' as const
      : suggested === 'liver_disease' ? 'medkit' as const
      : 'nutrition' as const;

    return (
      <AppScreen>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
            <Ionicons name={icon} size={48} color={theme.colors.primary} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 20, fontFamily: theme.fontFamilies.heading }}>
            Based on your answers
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: theme.lineHeights.body, fontFamily: theme.fontFamilies.body }}>
            NutriBot suggests the following category for personalized guidance:
          </Text>

          <Card style={styles.suggestionCard}>
            <ConditionPill condition={suggested || 'other'} />
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, textAlign: 'center', marginTop: 12, lineHeight: theme.lineHeights.sm, fontFamily: theme.fontFamilies.body }}>
              We'll tailor food recommendations and nutrient monitoring around this focus area.
            </Text>
          </Card>

          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, textAlign: 'center', marginTop: 12, fontStyle: 'italic', fontFamily: theme.fontFamilies.body }}>
            NutriScan provides general guidance, not medical advice. This suggestion helps us personalize the app for you.
          </Text>

          <View style={styles.resultActions}>
            <PrimaryButton label="Yes, that's right!" onPress={handleConfirm} icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />} />
            <SecondaryButton label="Not quite — let me re-answer" onPress={handleRestart} style={{ marginTop: 12 }} />
            <SecondaryButton
              label="I'll pick a condition myself"
              onPress={() => {
                setPrimaryCondition({ condition: 'other', source: 'unsure_ai' });
                router.push('/(onboarding)/goals');
              }}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  // ── Questions Step ───────────────────────────────────────────
  const q = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <AppScreen>
      <View style={styles.container}>
        {/* Progress */}
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.full }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary, borderRadius: theme.radius.full }]} />
        </View>
        <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamilies.body, textAlign: 'right', marginTop: 4 }}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </Text>

        {/* Question card */}
        <View style={{ marginTop: 24, flex: 1 }}>
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, fontFamily: theme.fontFamilies.heading, marginBottom: 20 }}>
            {q.text}
          </Text>
          <View style={styles.optionsList}>
            {q.options.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => handleAnswer(opt.conditions)}
                style={[styles.optionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
                accessibilityRole="button"
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, flex: 1 }}>
                  {opt.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, textAlign: 'center', marginTop: 16, lineHeight: theme.lineHeights.xs, fontFamily: theme.fontFamilies.body }}>
          These questions help us match you with the right guidance category.{"\n"}NutriScan does not diagnose — always consult your doctor.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderWidth: 2,
  },
  progressFill: {
    height: '100%',
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 3,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 3,
  },
  suggestionCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  resultActions: {
    marginTop: 28,
  },
});
