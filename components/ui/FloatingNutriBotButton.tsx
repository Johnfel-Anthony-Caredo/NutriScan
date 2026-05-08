import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

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
      {Platform.OS === 'android' && (
        <View style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow }]} pointerEvents="none" />
      )}
      <TouchableOpacity
        onPress={() => router.push('/nutribot')}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Open NutriBot assistant"
        style={[styles.touchable, {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.border,
          ...(Platform.OS === 'ios' ? theme.shadows.lg : {}),
        }]}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color={theme.colors.textInverse} />
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
  shadowBlock: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 0,
    bottom: 0,
    borderRadius: 30,
  },
  touchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
});
