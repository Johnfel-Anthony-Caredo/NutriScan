/**
 * SkeletonLoader — placeholder loading animation.
 *
 * Shows pulsing gray rectangles that match the expected
 * content layout during async operations.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonLoaderProps {
  /** Number of rows to render */
  rows?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ rows = 3, style }: SkeletonLoaderProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, style]}>
      {/* Title skeleton */}
      <Animated.View
        style={[styles.titleBlock, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.sm, opacity }]}
      />
      {/* Content rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Animated.View
            style={[styles.circle, { backgroundColor: theme.colors.surfaceSecondary, opacity }]}
          />
          <View style={styles.lines}>
            <Animated.View
              style={[styles.line, { width: '70%', backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.sm, opacity }]}
            />
            <Animated.View
              style={[styles.line, { width: '45%', backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.sm, opacity }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16, gap: 16 },
  titleBlock: { height: 24, width: '50%', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circle: { width: 40, height: 40, borderRadius: 20 },
  lines: { flex: 1, gap: 6 },
  line: { height: 14 },
});
