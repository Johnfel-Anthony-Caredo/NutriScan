import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  /** Use mint tint background instead of white (default: false) */
  mint?: boolean;
  /** Remove shadow, offset effect, and reduce border for a flat clean look */
  flat?: boolean;
}

export function Card({ children, style, noPadding = false, mint = false, flat = false }: CardProps) {
  const theme = useTheme();

  return (
    <View style={flat ? undefined : styles.shadowWrapper}>
      {/* Hard shadow block — only visible on Android where shadowRadius:0 doesn't work */}
      {!flat && Platform.OS === 'android' && (
        <View
          style={[
            styles.shadowBlock,
            {
              backgroundColor: theme.colors.shadow,
              borderRadius: theme.radius.md,
            },
          ]}
          pointerEvents="none"
        />
      )}
      <View
        style={[
          styles.card,
          {
            backgroundColor: mint ? theme.colors.surfaceSecondary : theme.colors.surface,
            borderRadius: theme.radius.md,
            borderColor: theme.colors.border,
            borderWidth: flat ? 2 : 3,
            ...(flat ? {} : Platform.OS === 'ios' ? theme.shadows.md : {}),
          },
          !noPadding && { padding: theme.spacing.md },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
  },
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  card: {
    borderWidth: 3,
  },
});
