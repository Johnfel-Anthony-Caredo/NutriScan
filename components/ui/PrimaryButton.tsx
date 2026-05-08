import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  icon,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      tension: 150,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {Platform.OS === 'android' && !isDisabled && (
        <View style={[styles.shadowBlock, { backgroundColor: theme.colors.shadow, borderRadius: theme.radius.full }]} pointerEvents="none" />
      )}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled ? theme.colors.primary + '60' : theme.colors.primary,
            borderRadius: theme.radius.full,
            borderColor: isDisabled ? theme.colors.textTertiary : theme.colors.border,
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.textInverse} size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.textInverse,
                  fontSize: theme.fontSizes.body,
                  fontFamily: theme.textStyles.label.fontFamily,
                  fontWeight: theme.fontWeights.bold,
                  marginLeft: icon ? 8 : 0,
                },
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowBlock: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    paddingHorizontal: 28,
    borderWidth: 3,
  },
  label: {
    letterSpacing: 0.3,
  },
});
