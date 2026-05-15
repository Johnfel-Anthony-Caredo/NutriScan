/**
 * ChatBubble — premium message bubble for NutriBot.
 *
 * Bot bubbles: left-aligned, white surface, rounded corners, branded avatar.
 * User bubbles: right-aligned, primary teal with white text.
 * Includes timestamp and optional medical disclaimer.
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
  bullet_list: { marginTop: 4, marginBottom: 4 },
  ordered_list: { marginTop: 4, marginBottom: 4 },
  list_item: { marginBottom: 2 },
  strong: { fontWeight: '700' as const },
  paragraph: { marginTop: 0, marginBottom: 8 },
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
      link: { color: theme.colors.primary, textDecorationLine: 'underline' as const },
      code_inline: {
        backgroundColor: theme.colors.surfaceSecondary,
        color: theme.colors.textPrimary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontFamily: 'monospace' as const,
        fontSize: theme.fontSizes.sm,
      },
      code_block: {
        backgroundColor: theme.colors.surfaceSecondary,
        padding: 12,
        borderRadius: 8,
        fontFamily: 'monospace' as const,
        fontSize: theme.fontSizes.sm,
        marginVertical: 6,
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
        paddingLeft: 10,
        marginVertical: 6,
        opacity: 0.85,
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
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
          <Ionicons name="chatbubble-ellipses" size={14} color="#FFFFFF" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isBot
            ? [
                styles.botBubble,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                },
              ]
            : [
                styles.userBubble,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                },
              ],
        ]}
      >
        {isBot ? (
          <Markdown style={mdStyle}>{message.text}</Markdown>
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
          <View style={[styles.disclaimerLine, { borderTopColor: theme.colors.borderLight }]}>
            <Ionicons name="information-circle-outline" size={13} color={isBot ? theme.colors.textTertiary : 'rgba(255,255,255,0.6)'} />
            <Text
              style={{
                color: isBot ? theme.colors.textTertiary : 'rgba(255,255,255,0.6)',
                fontSize: theme.fontSizes.xs,
                fontStyle: 'italic',
                lineHeight: theme.lineHeights.xs,
                flex: 1,
              }}
            >
              This is general guidance, not medical advice. Always consult your doctor.
            </Text>
          </View>
        )}
        <Text
          style={{
            color: isBot ? theme.colors.textTertiary : 'rgba(255,255,255,0.5)',
            fontSize: 11,
            marginTop: message.disclaimer ? 6 : 8,
            alignSelf: isBot ? 'flex-start' : 'flex-end',
            letterSpacing: 0.3,
          }}
        >
          {time}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { marginBottom: 16, paddingHorizontal: 16 },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', paddingRight: 52 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingLeft: 52 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 4,
    borderWidth: 2,
  },
  bubble: {
    padding: 14,
    maxWidth: '85%',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  botBubble: {
    borderWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  userBubble: {
    borderWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  disclaimerLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
  },
});