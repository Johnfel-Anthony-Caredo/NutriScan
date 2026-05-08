/**
 * Chat History Screen (F2) — date-grouped conversation list.
 *
 * Features:
 * - Conversations grouped by date (Today, Yesterday, older dates)
 * - Each row shows message preview, count, timestamp
 * - "New Chat" button in header
 * - Empty state for new users
 * - Tap row → opens NutriBot chat with past conversation
 */

import { AppScreen, EmptyState, TopBar } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { getConversations } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ConversationSection = {
  title: string;
  data: any[];
};

export default function ChatHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [sections, setSections] = useState<ConversationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await getConversations(user.id);
      
      if (!data || data.length === 0) {
        setSections([]);
        return;
      }

      // Group conversations by date
      const grouped: Record<string, any[]> = {};
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      data.forEach((conv) => {
        const dateObj = new Date(conv.updated_at);
        const dateStr = dateObj.toDateString();
        
        let label = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        if (dateStr === today) label = 'Today';
        else if (dateStr === yesterday) label = 'Yesterday';

        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(conv);
      });

      const sectionArray = Object.keys(grouped).map(key => ({
        title: key,
        data: grouped[key]
      }));

      setSections(sectionArray);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const hasHistory = sections.length > 0;

  return (
    <AppScreen noPadding>
      <TopBar title="Chat History" showBack />

      {/* New Chat button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <TouchableOpacity
          onPress={() => router.push('/nutribot')}
          style={[styles.newChatBtn, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, fontFamily: theme.fontFamilies.body, marginLeft: 8 }}>
            New Chat
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : hasHistory ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body, marginTop: 20, marginBottom: 8 }}>
              {title}
            </Text>
          )}
          renderItem={({ item }) => {
            const time = new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const messageCount = item.chat_messages && item.chat_messages[0] ? item.chat_messages[0].count : 0;
            
            return (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/nutribot', params: { conversationId: item.id } })}
                activeOpacity={0.7}
                style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
                accessibilityRole="button"
              >
                <View style={[styles.chatIcon, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
                  <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, fontFamily: theme.fontFamilies.body }} numberOfLines={1}>
                    {item.title || 'New Conversation'}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>
                      {messageCount} messages
                    </Text>
                    <View style={[styles.metaDot, { backgroundColor: theme.colors.border }]} />
                    <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamilies.body }}>
                      {time}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            subtitle={'Tap the New Chat button to start talking! \u{1F916}'}
            actionLabel="Start Chatting"
            onAction={() => router.push('/nutribot')}
          />
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  newChatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 3 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderWidth: 3 },
  chatIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2 },
  rowContent: { flex: 1, marginRight: 8 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  metaDot: { width: 6, height: 6, borderRadius: 3 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
});
