import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { teal } from '@/constants/theme';

export function FloatingNutriBotButton() {
  const theme = useTheme();
  const router = useRouter();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={() => router.push('/nutribot')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Open NutriBot assistant"
        style={[styles.touchable, theme.shadows.lg]}
      >
        <LinearGradient
          colors={[teal[400], teal[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 96 : 80,
    right: 20,
    zIndex: 100,
  },
  touchable: { borderRadius: 30 },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
