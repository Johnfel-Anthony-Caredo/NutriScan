import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export function NutriBotShimmer() {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.row, { paddingHorizontal: 16, paddingRight: 48 }]}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
        <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.primary} />
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <View style={styles.shimmerWrap}>
          <Animated.View style={[styles.shimmerLine, { width: '72%', backgroundColor: theme.colors.surfaceSecondary, opacity }]} />
          <Animated.View style={[styles.shimmerLine, { width: '58%', backgroundColor: theme.colors.surfaceSecondary, opacity }]} />
          <Animated.View style={[styles.shimmerLine, { width: '81%', backgroundColor: theme.colors.surfaceSecondary, opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4, borderWidth: 2 },
  bubble: { padding: 14, borderWidth: 3, width: '75%' },
  shimmerWrap: {
    gap: 10,
    width: '100%',
  },
  shimmerLine: {
    height: 12,
    borderRadius: 6,
  },
});
