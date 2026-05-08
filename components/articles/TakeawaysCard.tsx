/**
 * TakeawaysCard — clean, minimal key takeaways section.
 *
 * No heavy borders or artificial boxes. Uses subtle surface tint,
 * generous spacing, and small checkmark bullets for a premium feel.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface TakeawaysCardProps {
  takeaways: string[];
}

export function TakeawaysCard({ takeaways }: TakeawaysCardProps) {
  const theme = useTheme();

  if (takeaways.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primaryLight,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="bulb" size={16} color={theme.colors.textInverse} />
        </View>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.body,
            fontWeight: theme.fontWeights.semibold,
            marginLeft: 10,
          }}
        >
          Key Takeaways
        </Text>
      </View>

      {/* List */}
      {takeaways.map((point, i) => (
        <View key={i} style={[styles.row, i < takeaways.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.safe.icon} style={{ marginTop: 1 }} />
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.sm,
              lineHeight: theme.lineHeights.sm,
              marginLeft: 10,
              flex: 1,
            }}
          >
            {point}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
});
