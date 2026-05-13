import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontFamily: theme.textStyles.h2.fontFamily,
            fontWeight: theme.fontWeights.bold,
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
                fontFamily: theme.textStyles.label.fontFamily,
                fontWeight: theme.fontWeights.bold,
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
    marginTop: 28,
    marginBottom: 14,
  },
  title: {
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  action: {
    marginLeft: 12,
    letterSpacing: 0.3,
  },
});
