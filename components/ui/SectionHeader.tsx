/**
 * SectionHeader — section title with optional right-side action link.
 *
 * Used throughout the app for content sections:
 *   <SectionHeader title="Today's Log" action="See all" onAction={…} />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SectionHeaderProps {
  title: string;
  /** Right-side action label (e.g., "See all") */
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.semibold,
          },
        ]}
      >
        {title}
      </Text>
      {action && onAction && (
        <TouchableOpacity
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={action}
        >
          <Text
            style={[
              styles.action,
              {
                color: theme.colors.primary,
                fontSize: theme.fontSizes.sm,
                fontWeight: theme.fontWeights.medium,
              },
            ]}
          >
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
  },
  action: {
    marginLeft: 12,
  },
});
