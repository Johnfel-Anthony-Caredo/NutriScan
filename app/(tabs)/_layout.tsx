import React from 'react';
import { View, StyleSheet } from 'react-native';
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
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: theme.fontSizes.xs,
            fontWeight: theme.fontWeights.medium,
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
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tabs>

      {/* FAB visible on all tab screens — hidden on Scan via the Scan screen itself */}
      <FloatingNutriBotButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
