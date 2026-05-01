/**
 * Chat History Screen (F2) — date-grouped conversation list.
 *
 * Features:
 * - Conversations grouped by date (Today, Yesterday, older dates)
 * - Each row shows message preview, count, timestamp
 * - "New Chat" button in header
 * - Empty state for new users
 * - Tap row → opens NutriBot chat
 */

import React from 'react';
import { View, Text, TouchableOpacity, SectionList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, Card, EmptyState, PrimaryButton } from '@/components/ui';
import { MOCK_CHAT_HISTORY } from '@/data/mockData';

export default function ChatHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();

  const sections = MOCK_CHAT_HISTORY.map((group) => ({
    title: group.date,
    data: group.conversations,
  }));

  const hasHistory = sections.some((s) => s.data.length > 0);

  return (
    <AppScreen noPadding>
      <TopBar title="Chat History" showBack />

      {/* New Chat button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <TouchableOpacity
          onPress={() => router.push('/nutribot')}
          style={[styles.newChatBtn, { backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.md }]}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.semibold, marginLeft: 8 }}>
            New Chat
          </Text>
        </TouchableOpacity>
      </View>

      {hasHistory ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginTop: 20, marginBottom: 8 }}>
              {title}
            </Text>
          )}
          renderItem={({ item }) => {
            const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <TouchableOpacity
                onPress={() => router.push('/nutribot')}
                activeOpacity={0.7}
                style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: theme.radius.lg, ...theme.shadows.sm }]}
                accessibilityRole="button"
              >
                <View style={[styles.chatIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }} numberOfLines={1}>
                    {item.preview}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>
                      {item.messageCount} messages
                    </Text>
                    <View style={[styles.metaDot, { backgroundColor: theme.colors.textTertiary }]} />
                    <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>
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
            subtitle={'Tap the NutriBot button to start chatting! \u{1F916}'}
            actionLabel="Start Chatting"
            onAction={() => router.push('/nutribot')}
          />
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  newChatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderWidth: StyleSheet.hairlineWidth },
  chatIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowContent: { flex: 1, marginRight: 8 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
});
