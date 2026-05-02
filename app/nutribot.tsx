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
 * - Conversation Persistence
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, ConditionPill, ChatBubble, NutriBotShimmer } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getMessages, createConversation, insertMessage } from '@/services/supabaseService';
import type { ChatMessage } from '@/components/ui/ChatBubble';

const SUGGESTIONS = [
  'Is this food safe for me?',
  'What should I eat for breakfast?',
  'Explain my last scan',
  'What foods are high in sodium?',
  'Give me a healthy meal idea',
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  text: 'Hi there! \u{1F44B} I\'m NutriBot, your food health assistant.\n\nAsk me anything about your diet, scans, or health conditions. I\'m here to help you make informed food choices!',
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!params.conversationId);
  const flatListRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

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
            // Replace welcome message with actual history
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

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setIsStreaming(false);
    setStreamingText('');
    scrollToEnd();

    let currentConvId = activeConversationId;

    try {
      // 1. If this is the first message, create the conversation
      if (!currentConvId) {
        const newConv = await createConversation(user.id, text.trim());
        currentConvId = newConv.id;
        setActiveConversationId(newConv.id);
      }

      // 2. Save the user message to the database
      await insertMessage(currentConvId, 'user', text.trim());

      // 3. Prepare messages for AI
      const currentMessages = [...messages, userMsg].map((m) => ({
        role: m.sender === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));

      // 4. Call Edge Function with streaming fetch
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/nutribot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: currentMessages, profile }),
        // @ts-ignore
        reactNative: { textStreaming: true },
      });

      if (!response.ok) {
        let errText = await response.text();
        try {
          const errJson = JSON.parse(errText);
          errText = errJson.error || errText;
        } catch {}
        throw new Error(errText);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Streaming not supported on this device');

      const decoder = new TextDecoder();
      let replyText = '';

      setIsTyping(false);
      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        replyText += chunk;
        setStreamingText(replyText);
        scrollToEnd();
      }

      setIsStreaming(false);
      setStreamingText('');

      if (!replyText) {
        replyText = 'I am sorry, I received an empty response.';
      }
      
      // 5. Save the AI response to the database
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
        text: `⚠️ Error connecting to AI: ${errorDetail}\n\nPlease check your configuration or try again later.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      scrollToEnd();
    }
  }, [messages, profile, user, activeConversationId, scrollToEnd]);

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

      {isLoadingHistory ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
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
                {isTyping && !isStreaming && <NutriBotShimmer />}
                {isStreaming && (
                  <ChatBubble 
                    message={{
                      id: 'streaming-bubble',
                      text: streamingText,
                      sender: 'bot',
                      timestamp: new Date(),
                      disclaimer: false,
                    }}
                  />
                )}
              </>
            }
          />

          {/* Quick suggestions — fixed above input bar when few messages */}
          {messages.length <= 2 && !isTyping && (
            <View style={[styles.suggestionsWrap, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border, paddingTop: 12, backgroundColor: theme.colors.surface }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
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
              </ScrollView>
            </View>
          )}

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
      )}
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
