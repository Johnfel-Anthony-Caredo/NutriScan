import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { FloatingNutriBotButton } from '@/components/ui';

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: TabIcon;
  iconFocused: TabIcon;
}[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'scan', title: 'Scan', icon: 'scan-outline', iconFocused: 'scan' },
  { name: 'history', title: 'History', icon: 'time-outline', iconFocused: 'time' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabIconActive,
          tabBarInactiveTintColor: theme.colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.tabBarBorder,
            borderTopWidth: 3,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
            letterSpacing: 0.3,
          },
          tabBarActiveBackgroundColor: 'transparent',
          tabBarItemStyle: {
            paddingTop: 4,
          },
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? tab.iconFocused : tab.icon}
                  size={focused ? size + 2 : size}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tabs>

      <FloatingNutriBotButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
