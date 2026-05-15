/**
 * Tab Layout — 5-tab grounded dock-style bottom navbar.
 *
 * Tabs: Home · History · [Scan] · NutriBot · Profile
 * Navbar hidden on Scan and NutriBot for full-screen immersion.
 * Center Scan button sits cleanly integrated into the dock.
 */

import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

type TabIcon = keyof typeof Ionicons.glyphMap;

interface TabEntry {
  name: string;
  title: string;
  icon: TabIcon;
  iconFocused: TabIcon;
  isCenter?: boolean;
}

const TABS: TabEntry[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'history', title: 'History', icon: 'time-outline', iconFocused: 'time' },
  { name: 'scan', title: '', icon: 'scan-outline', iconFocused: 'scan', isCenter: true },
  { name: 'nutribot', title: 'NutriBot', icon: 'chatbubble-ellipses-outline', iconFocused: 'chatbubble-ellipses' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

const HIDDEN_BAR_ROUTES = new Set(['scan', 'nutribot']);

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabIconActive,
          tabBarInactiveTintColor: theme.colors.tabIconDefault,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 16,
            marginHorizontal: 16,
            backgroundColor: theme.colors.tabBar,
            borderColor: theme.colors.tabBarBorder,
            borderWidth: 3,
            borderRadius: 20,
            height: 64,
            paddingBottom: 0,
            paddingTop: 0,
            display: HIDDEN_BAR_ROUTES.has(route.name) ? 'none' : 'flex',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
              },
              android: { elevation: 8 },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: theme.textStyles.label.fontFamily,
            fontWeight: theme.fontWeights.bold,
            marginTop: 2,
            marginBottom: Platform.OS === 'ios' ? 4 : 8,
          },
          tabBarItemStyle: {
            paddingTop: 6,
            paddingBottom: 12,
          },
        })}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarLabel: tab.isCenter ? () => null : undefined,
              tabBarIcon: tab.isCenter
                ? () => (
                  <View
                    style={[
                      styles.centerBtn,
                      {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.border,
                      },
                      Platform.select({
                        ios: {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 6,
                        },
                        android: { elevation: 4 },
                      }),
                    ]}
                  >
                    <Ionicons name="scan" size={32} color="#FFFFFF" />
                  </View>
                )
                : ({ focused, color }) => (
                  <Ionicons
                    name={focused ? tab.iconFocused : tab.icon}
                    size={24}
                    color={color}
                  />
                ),
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
  },
});
