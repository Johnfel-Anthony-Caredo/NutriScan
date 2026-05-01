/**
 * Article Detail — modal screen for health tip articles.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, Card } from '@/components/ui';

export default function ArticleDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Health Tip" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Hero placeholder */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.colors.primaryLight,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <Ionicons name="newspaper" size={48} color={theme.colors.primary} />
        </View>

        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes['2xl'],
            fontWeight: theme.fontWeights.bold,
            marginTop: 20,
          }}
        >
          Managing blood sugar with fiber
        </Text>

        <Text
          style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSizes.sm,
            marginTop: 6,
            marginBottom: 20,
          }}
        >
          Article #{id} · 5 min read
        </Text>

        <Card>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSizes.body,
              lineHeight: theme.lineHeights.body,
            }}
          >
            This is a placeholder for the full article content. In Phase 3+, this will be populated with real health tips and nutritional guidance tailored to the user's conditions.{'\n\n'}
            Fiber-rich foods help slow the absorption of sugar and improve blood sugar levels. A high-fiber diet can also reduce the risk of developing type 2 diabetes.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
