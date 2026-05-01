/**
 * NutriBot Chat — modal screen for the AI health assistant.
 *
 * Polished placeholder showing chat UI structure with
 * quick suggestion chips and a welcome message.
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, Card, ConditionPill } from '@/components/ui';

const SUGGESTIONS = [
  'Is this food safe for me?',
  'What should I eat for breakfast?',
  'Explain my last scan',
  'What foods are high in sodium?',
];

export default function NutriBotScreen() {
  const theme = useTheme();

  return (
    <AppScreen noPadding>
      <TopBar title="NutriBot" showBack />

      {/* ── Context Pills ─────────────── */}
      <View style={[styles.contextBar, { borderBottomColor: theme.colors.border }]}>
        <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginRight: 8 }}>
          Your conditions:
        </Text>
        <ConditionPill condition="diabetes" compact />
        <ConditionPill condition="hypertension" compact />
      </View>

      {/* ── Chat Area ─────────────────── */}
      <View style={styles.chatArea}>
        {/* Bot welcome message */}
        <View style={styles.botMessageRow}>
          <View
            style={[
              styles.botAvatar,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color={theme.colors.primary} />
          </View>
          <Card style={styles.botBubble}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.body,
                lineHeight: theme.lineHeights.body,
              }}
            >
              Hi there! 👋 I'm NutriBot, your food health assistant.{'\n\n'}
              Ask me anything about your diet, scans, or health conditions. I'm here to help!
            </Text>
          </Card>
        </View>

        {/* Quick Suggestions */}
        <View style={styles.suggestionsWrap}>
          <Text
            style={{
              color: theme.colors.textTertiary,
              fontSize: theme.fontSizes.sm,
              marginBottom: 10,
              paddingHorizontal: 20,
            }}
          >
            Try asking:
          </Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.full,
                  },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: theme.fontSizes.sm,
                  }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ── Input Bar ─────────────────── */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TextInput
          placeholder="Ask NutriBot anything..."
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: theme.radius.full,
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
            },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  chatArea: {
    flex: 1,
    paddingTop: 20,
  },
  botMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  botBubble: {
    flex: 1,
    maxWidth: '80%',
  },
  suggestionsWrap: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 18,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
