/**
 * Settings Screen — app configuration and preferences.
 *
 * Grouped logically: Appearance, Notifications, Privacy, Support, About.
 * Clean, simple layout that doesn't feel crowded.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, TopBar, Card, SectionHeader } from '@/components/ui';
import { useProfile } from '@/context/ProfileContext';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
}

function SettingsRow({ icon, label, subtitle, onPress, trailing, danger }: SettingsRowProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !trailing}
      activeOpacity={0.7}
      style={[styles.settingsRow, { borderBottomColor: theme.colors.borderLight }]}
      accessibilityRole="button"
    >
      <View style={[styles.iconWrap, { backgroundColor: danger ? theme.colors.avoid.bg : theme.colors.surfaceSecondary }]}>
        <Ionicons name={icon} size={18} color={danger ? theme.colors.avoid.icon : theme.colors.primary} />
      </View>
      <View style={styles.labelWrap}>
        <Text style={{ color: danger ? theme.colors.avoid.text : theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }}>
          {label}
        </Text>
        {subtitle && (
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ?? (
        onPress && <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { resetProfile } = useProfile();
  const [darkMode, setDarkMode] = useState(false);
  const [scanReminders, setScanReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Reset Profile',
      'This will clear your health profile and restart onboarding. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => { resetProfile(); router.replace('/'); } },
      ],
    );
  };

  return (
    <AppScreen scroll noPadding>
      <TopBar title="Settings" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>

        {/* ── Appearance ──────────────────── */}
        <SectionHeader title="Appearance" />
        <Card noPadding>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            subtitle="Coming soon"
            trailing={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.colors.surfaceSecondary, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsRow icon="language-outline" label="Language" subtitle="English" onPress={() => {}} />
        </Card>

        {/* ── Notifications ───────────────── */}
        <SectionHeader title="Notifications" />
        <Card noPadding>
          <SettingsRow
            icon="notifications-outline"
            label="Scan Reminders"
            subtitle="Remind me to scan my meals"
            trailing={
              <Switch
                value={scanReminders}
                onValueChange={setScanReminders}
                trackColor={{ false: theme.colors.surfaceSecondary, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsRow
            icon="stats-chart-outline"
            label="Weekly Report"
            subtitle="Receive weekly nutrition summary"
            trailing={
              <Switch
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: theme.colors.surfaceSecondary, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        {/* ── Privacy ─────────────────────── */}
        <SectionHeader title="Privacy" />
        <Card noPadding>
          <SettingsRow icon="lock-closed-outline" label="Data Privacy" subtitle="Your data stays on your device" onPress={() => {}} />
          <SettingsRow icon="trash-outline" label="Clear Scan History" onPress={() => Alert.alert('Clear History', 'This will remove all scanned food history.', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive' }])} />
        </Card>

        {/* ── Support ─────────────────────── */}
        <SectionHeader title="Support" />
        <Card noPadding>
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => {}} />
          <SettingsRow icon="chatbox-outline" label="Send Feedback" onPress={() => {}} />
          <SettingsRow icon="star-outline" label="Rate NutriScan" onPress={() => {}} />
        </Card>

        {/* ── Medical Disclaimer ──────────── */}
        <SectionHeader title="About" />
        <Card>
          <View style={styles.disclaimerRow}>
            <Ionicons name="medical-outline" size={20} color={theme.colors.caution.icon} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, lineHeight: theme.lineHeights.sm, marginLeft: 10, flex: 1 }}>
              NutriScan provides general nutritional guidance and is not a substitute for professional medical advice. Always consult your doctor or registered dietitian for personalized health decisions.
            </Text>
          </View>
        </Card>

        <Card noPadding style={{ marginTop: 8 }}>
          <SettingsRow icon="information-circle-outline" label="App Version" subtitle="1.0.0 (MVP)" />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
        </Card>

        {/* ── Danger Zone ────────────────── */}
        <View style={{ marginTop: 24 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: theme.colors.avoid.border, borderRadius: theme.radius.md }]}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.avoid.icon} />
            <Text style={{ color: theme.colors.avoid.text, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginLeft: 8 }}>
              Reset Profile & Restart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  iconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  labelWrap: { flex: 1 },
  disclaimerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderWidth: 1.5 },
});
