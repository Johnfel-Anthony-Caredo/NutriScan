/**
 * NutriBot Chat — full interactive chat with the AI health assistant.
 *
 * Features:
 * - Context-aware header showing user condition pills
 * - User and bot message bubbles with timestamps
 * - Quick suggestion chips
 * - Typing indicator during bot "responses"
 * - Warm, supportive tone with medical disclaimers
 * - Scrolls to latest message
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, ConditionPill, ChatBubble, TypingIndicator } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import type { ChatMessage } from '@/components/ui/ChatBubble';

const SUGGESTIONS = [
  'Is this food safe for me?',
  'What should I eat for breakfast?',
  'Explain my last scan',
  'What foods are high in sodium?',
  'Give me a healthy meal idea',
];

const BOT_RESPONSES: Record<string, string> = {
  'Is this food safe for me?': 'It depends on the specific food! Scan it using the Scan tab and I\'ll analyze it against your health profile. Generally, fresh fruits, vegetables, and lean proteins are great choices.',
  'What should I eat for breakfast?': 'For a heart-healthy breakfast, try oatmeal with berries and a small handful of walnuts. It\'s high in fiber and low in sodium — perfect for your profile! You could also try scrambled eggs with spinach.',
  'Explain my last scan': 'Your last scanned item was Instant Ramen Noodles, which got an "Avoid" verdict. The main issue was very high sodium (1,820mg per serving), which exceeds your daily limit of 1,500mg. Try swapping it for a low-sodium soup or a brown rice bowl.',
  'What foods are high in sodium?': 'Common high-sodium foods include: canned soups, processed meats (bacon, hot dogs), instant noodles, soy sauce, pickled foods, and most fast food. Always check the nutrition label — aim for less than 600mg per serving.',
  'Give me a healthy meal idea': 'How about grilled salmon with roasted sweet potatoes and steamed broccoli? Salmon is rich in omega-3s (great for heart health), sweet potatoes are low in sodium, and broccoli adds fiber. Season with herbs instead of salt!',
};

const DEFAULT_RESPONSE = 'That\'s a great question! Based on your health profile, I\'d recommend focusing on whole, unprocessed foods that are low in sodium and sugar. Would you like me to suggest some specific meals or snacks?';

const WELCOME: ChatMessage = {
  id: 'welcome',
  text: 'Hi there! \u{1F44B} I\'m NutriBot, your food health assistant.\n\nAsk me anything about your diet, scans, or health conditions. I\'m here to help you make informed food choices!',
  sender: 'bot',
  timestamp: new Date(Date.now() - 60000),
};

export default function NutriBotScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    scrollToEnd();

    // Simulate bot response delay
    setTimeout(() => {
      const response = BOT_RESPONSES[text.trim()] ?? DEFAULT_RESPONSE;
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        disclaimer: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      scrollToEnd();
    }, 1200 + Math.random() * 800);
  }, [scrollToEnd]);

  const handleSend = () => sendMessage(input);
  const handleChip = (text: string) => sendMessage(text);

  return (
    <AppScreen noPadding>
      <TopBar
        title="NutriBot"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => router.push('/chat-history')} accessibilityRole="button" accessibilityLabel="Chat history">
            <Ionicons name="time-outline" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      {/* Condition context bar */}
      {profile.conditions.length > 0 && (
        <View style={[styles.contextBar, { borderBottomColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginRight: 8 }}>
            Your conditions:
          </Text>
          {profile.conditions.slice(0, 3).map((c) => (
            <ConditionPill key={c} condition={c} compact />
          ))}
          {profile.conditions.length > 3 && (
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>+{profile.conditions.length - 3}</Text>
          )}
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListFooterComponent={
            <>
              {isTyping && <TypingIndicator />}

              {/* Quick suggestions — shown only when few messages */}
              {messages.length <= 2 && !isTyping && (
                <View style={styles.suggestionsWrap}>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginBottom: 10, paddingHorizontal: 16 }}>
                    Try asking:
                  </Text>
                  <View style={styles.chips}>
                    {SUGGESTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => handleChip(s)}
                        style={[styles.chip, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderRadius: theme.radius.full }]}
                        accessibilityRole="button"
                      >
                        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask NutriBot anything..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.input, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.full, color: theme.colors.textPrimary, fontSize: theme.fontSizes.body }]}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            accessibilityLabel="Chat message input"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            style={[styles.sendBtn, { backgroundColor: input.trim() && !isTyping ? theme.colors.primary : theme.colors.surfaceSecondary, borderRadius: theme.radius.full }]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons name="arrow-up" size={20} color={input.trim() && !isTyping ? '#FFFFFF' : theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  contextBar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  messageList: { paddingTop: 16, paddingBottom: 8 },
  suggestionsWrap: { paddingTop: 8, paddingBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  input: { flex: 1, height: 44, paddingHorizontal: 18 },
  sendBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});
