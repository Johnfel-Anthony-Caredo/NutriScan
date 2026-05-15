/**
 * NutriBotShimmer — polished loading indicator for bot responses.
 *
 * Animated shimmer lines inside a bot-style bubble with avatar.
 * Uses a smooth opacity pulse for a clean, modern feel.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export function NutriBotShimmer() {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.6],
  });

  return (
    <View style={[styles.row, { paddingHorizontal: 16, paddingRight: 52 }]}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
        <Ionicons name="chatbubble-ellipses" size={14} color="#FFFFFF" />
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <View style={styles.shimmerWrap}>
          <Animated.View
            style={[
              styles.shimmerLine,
              { backgroundColor: theme.colors.surfaceSecondary, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmerLine,
              styles.lineMedium,
              { backgroundColor: theme.colors.surfaceSecondary, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmerLine,
              styles.lineShort,
              { backgroundColor: theme.colors.surfaceSecondary, opacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
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
    padding: 16,
    borderWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    width: '70%',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  shimmerWrap: {
    gap: 10,
    width: '100%',
  },
  shimmerLine: {
    height: 12,
    borderRadius: 6,
    width: '82%',
  },
  lineMedium: {
    width: '65%',
  },
  lineShort: {
    width: '45%',
  },
});