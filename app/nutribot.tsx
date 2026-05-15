/**
 * NutriBot Chat — full interactive chat with the AI health assistant.
 *
 * Features:
 * - Branded header with conditions context card
 * - User and bot message bubbles with timestamps
 * - Quick suggestion chips with icons
 * - Typing indicator during bot "responses"
 * - Warm, supportive tone with medical disclaimers
 * - Scrolls to latest message
 * - Conversation Persistence
 */

import { AppScreen, ChatBubble, ConditionPill, NutriBotShimmer, TopBar } from '@/components/ui';
import type { ChatMessage } from '@/components/ui/ChatBubble';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { createConversation, getMessages, insertMessage } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SuggestionItem = {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SUGGESTIONS: SuggestionItem[] = [
  { text: 'What should I eat for breakfast?', icon: 'sunny-outline' },
  { text: 'Explain my last scan', icon: 'document-text-outline' },
  { text: 'What foods are high in sodium?', icon: 'flask-outline' },
  { text: 'Give me a healthy meal idea', icon: 'restaurant-outline' },
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  text: 'Hi there! \u{1F44B} I\'m **NutriBot**, your personal food health assistant.\n\nAsk me anything about your diet, scans, or health conditions — I\'m here to help you make informed, confident food choices every day.',
  sender: 'bot',
  timestamp: new Date(Date.now() - 60000),
};

export default function NutriBotScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const { profile } = useProfile();
  const { user } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(params.conversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!params.conversationId);
  const flatListRef = useRef<FlatList>(null);

  const hasConditions = profile.conditions.length > 0;
  const isFirstMessage = messages.length <= 1 && !isTyping;

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      const idx = messages.length - 1;
      if (idx >= 0) {
        try {
          flatListRef.current?.scrollToIndex({ index: idx, viewPosition: 0, animated: true });
        } catch {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }
    }, 150);
  }, [messages.length]);

  // Load chat history if a conversationId was passed
  useEffect(() => {
    async function loadHistory() {
      if (params.conversationId) {
        try {
          const history = await getMessages(params.conversationId);
          if (history.length > 0) {
            const loadedMessages: ChatMessage[] = history.map(m => ({
              id: m.id,
              text: m.content,
              sender: m.role === 'assistant' ? 'bot' : 'user',
              timestamp: new Date(m.created_at),
              disclaimer: m.role === 'assistant',
            }));
            setMessages(loadedMessages);
          }
        } catch (err) {
          console.error('Failed to load conversation history:', err);
        } finally {
          setIsLoadingHistory(false);
          scrollToEnd();
        }
      }
    }
    loadHistory();
  }, [params.conversationId, scrollToEnd]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !user) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    const messagesBefore = messages;
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    scrollToEnd();

    let currentConvId = activeConversationId;

    try {
      if (!currentConvId) {
        const newConv = await createConversation(user.id, text.trim());
        currentConvId = newConv.id;
        setActiveConversationId(newConv.id);
      }

      await insertMessage(currentConvId, 'user', text.trim());

      const currentMessages = [...messagesBefore, userMsg].map((m) => ({
        role: m.sender === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/nutribot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: currentMessages, profile }),
      });

      if (!response.ok) {
        let errText = await response.text();
        try {
          const errJson = JSON.parse(errText);
          errText = errJson.error || errText;
        } catch {}
        throw new Error(errText);
      }

      const data = await response.json();
      const replyText: string = data.reply || 'I am sorry, I received an empty response.';

      await insertMessage(currentConvId, 'assistant', replyText);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: replyText,
        sender: 'bot',
        timestamp: new Date(),
        disclaimer: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Error invoking nutribot edge function:', err);
      const errorDetail = err.message || JSON.stringify(err);
      const errorMsg: ChatMessage = {
        id: `bot-error-${Date.now()}`,
        text: `⚠️ **Connection issue**\n\nI couldn’t reach the AI: ${errorDetail}\n\nPlease check your connection and try again later.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      scrollToEnd();
    }
  }, [messages, profile, user, activeConversationId, scrollToEnd]);

  const renderBubble = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    [],
  );
  const keyExtractor = useCallback((m: ChatMessage) => m.id, []);

  const handleSend = () => sendMessage(input);
  const handleChip = (text: string) => sendMessage(text);

  const conditionsChips = useMemo(
    () => profile.conditions.slice(0, 3),
    [profile.conditions],
  );
  const conditionsOverflow = profile.conditions.length > 3;

  return (
    <AppScreen noPadding>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={{ flex: 1 }}>
          <TopBar
            title="NutriBot"
            showBack
            onBack={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            rightAction={
              <TouchableOpacity onPress={() => router.push('/chat-history')} accessibilityRole="button" accessibilityLabel="Chat history">
                <Ionicons name="time-outline" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            }
          />

          {/* Conditions — slim inline chip bar */}
          {hasConditions && (
            <View style={styles.conditionsBar}>
              <View style={styles.conditionsLabel}>
                <View style={[styles.condDot, { backgroundColor: theme.colors.primary }]} />
                <Text
                  style={{
                    color: theme.colors.textTertiary,
                    fontSize: theme.fontSizes.xs,
                    fontFamily: theme.fontFamilies.heading,
                    fontWeight: theme.fontWeights.semibold,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Your Conditions
                </Text>
              </View>
              <View style={styles.condChips}>
                {conditionsChips.map((c) => (
                  <ConditionPill key={c} condition={c} compact />
                ))}
                {conditionsOverflow && (
                  <Text
                    style={{
                      color: theme.colors.textTertiary,
                      fontSize: theme.fontSizes.xs,
                      fontFamily: theme.fontFamilies.heading,
                      fontWeight: theme.fontWeights.bold,
                      marginLeft: 2,
                    }}
                  >
                    +{profile.conditions.length - 3}
                  </Text>
                )}
              </View>
            </View>
          )}

          {isLoadingHistory ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {/* Messages list */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={keyExtractor}
                contentContainerStyle={[
                  styles.messageList,
                  isFirstMessage && hasConditions && styles.messageListWithContext,
                ]}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToEnd}
                renderItem={renderBubble}
                ListFooterComponent={isTyping ? <NutriBotShimmer /> : null}
                windowSize={5}
                maxToRenderPerBatch={10}
                removeClippedSubviews
              />

              {/* Quick suggestions — floating chip row when conversation is fresh */}
              {isFirstMessage && (
                <View style={styles.suggestionsOuter}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
                    {SUGGESTIONS.map((s) => (
                      <TouchableOpacity
                        key={s.text}
                        onPress={() => handleChip(s.text)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: theme.colors.surfaceSecondary,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        accessibilityRole="button"
                        activeOpacity={0.7}
                      >
                        <Ionicons name={s.icon} size={15} color={theme.colors.primary} style={{ marginRight: 6 }} />
                        <Text
                          style={{
                            color: theme.colors.textPrimary,
                            fontSize: theme.fontSizes.sm,
                            fontFamily: theme.fontFamilies.body,
                            fontWeight: theme.fontWeights.medium,
                          }}
                        >
                          {s.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Input bar */}
              <View
                style={[
                  styles.inputBar,
                  {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    shadowColor: theme.colors.shadow,
                  },
                ]}
              >
                <View
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask NutriBot anything..."
                    placeholderTextColor={theme.colors.textTertiary}
                    style={{
                      flex: 1,
                      height: 44,
                      color: theme.colors.textPrimary,
                      fontSize: theme.fontSizes.body,
                      fontFamily: theme.fontFamilies.body,
                      paddingHorizontal: 16,
                    }}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    accessibilityLabel="Chat message input"
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={!input.trim() || isTyping}
                    style={[
                      styles.sendBtn,
                      {
                        backgroundColor: input.trim() && !isTyping ? theme.colors.primary : theme.colors.surfaceSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={input.trim() && !isTyping ? '#FFFFFF' : theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  conditionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  conditionsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  condDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  condChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  messageListWithContext: {
    paddingTop: 4,
  },
  suggestionsOuter: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingRight: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 2,
    borderRadius: 999,
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 22,
    borderTopWidth: 3,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 3,
    paddingRight: 3,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
});