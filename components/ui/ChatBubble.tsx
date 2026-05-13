/**
 * ChatBubble — message bubble for bot and user messages.
 *
 * Bot bubbles: left-aligned, light surface, with avatar.
 * User bubbles: right-aligned, primary-colored.
 * Includes timestamp and optional disclaimer.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import Markdown from 'react-native-markdown-display';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  /** Soft medical disclaimer appended to bot messages */
  disclaimer?: boolean;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

const TIME_OPTS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

const baseMarkdownStyles = {
  heading1: { fontSize: 22, fontWeight: '700' as const, marginBottom: 8 },
  heading2: { fontSize: 18, fontWeight: '700' as const, marginBottom: 6 },
  heading3: { fontSize: 16, fontWeight: '700' as const, marginBottom: 4 },
  bullet_list: { marginTop: 4 },
  ordered_list: { marginTop: 4 },
  strong: { fontWeight: '700' as const },
};

export const ChatBubble = React.memo(function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useTheme();
  const isBot = message.sender === 'bot';
  const time = message.timestamp.toLocaleTimeString([], TIME_OPTS);

  const mdStyle = React.useMemo(
    () => ({
      body: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSizes.body,
        fontFamily: theme.fontFamilies.body,
        lineHeight: theme.lineHeights.body,
      },
      link: { color: theme.colors.primary },
      code_inline: {
        backgroundColor: theme.colors.surfaceSecondary,
        color: theme.colors.textPrimary,
        paddingHorizontal: 6,
        borderRadius: 6,
        fontFamily: 'monospace' as const,
      },
      code_block: {
        backgroundColor: theme.colors.surfaceSecondary,
        padding: 10,
        borderRadius: 8,
        fontFamily: 'monospace' as const,
        fontSize: theme.fontSizes.sm,
      },
      ...baseMarkdownStyles,
    }),
    [
      theme.colors.textPrimary,
      theme.colors.primary,
      theme.colors.surfaceSecondary,
      theme.fontSizes.body,
      theme.fontSizes.sm,
      theme.fontFamilies.body,
      theme.lineHeights.body,
    ],
  );

  return (
    <View style={[styles.row, isBot ? styles.botRow : styles.userRow]}>
      {isBot && (
        <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
          <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isBot
            ? { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 3, borderTopLeftRadius: 4 }
            : { backgroundColor: theme.colors.primary, borderTopRightRadius: 4 },
          { borderRadius: theme.radius.lg },
        ]}
      >
        {isBot ? (
          <Markdown style={mdStyle}>
            {message.text}
          </Markdown>
        ) : (
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: theme.fontSizes.body,
              fontFamily: theme.fontFamilies.body,
              lineHeight: theme.lineHeights.body,
            }}
          >
            {message.text}
          </Text>
        )}
        {message.disclaimer && (
          <Text
            style={{
              color: isBot ? theme.colors.textTertiary : 'rgba(255,255,255,0.7)',
              fontSize: theme.fontSizes.xs,
              marginTop: 8,
              fontStyle: 'italic',
              lineHeight: theme.lineHeights.xs,
            }}
          >
            This is general guidance, not medical advice. Always consult your doctor.
          </Text>
        )}
        <Text
          style={{
            color: isBot ? theme.colors.textTertiary : 'rgba(255,255,255,0.6)',
            fontSize: 11,
            marginTop: 4,
            alignSelf: isBot ? 'flex-start' : 'flex-end',
          }}
        >
          {time}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { marginBottom: 12, paddingHorizontal: 16 },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', paddingRight: 48 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingLeft: 48 },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4, borderWidth: 2 },
  bubble: { padding: 14, maxWidth: '88%' },
});
