/**
 * Scan Screen — camera scan hub with Photo/Barcode toggle.
 *
 * Full-screen focused scanner. Capture sends to preview,
 * manual search opens the search modal.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppScreen, PrimaryButton, SecondaryButton } from '@/components/ui';

type ScanMode = 'photo' | 'barcode';

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>('photo');

  const handleCapture = () => {
    router.push('/scan-preview');
  };

  const handleSearch = () => {
    router.push('/manual-search');
  };

  return (
    <AppScreen noPadding>
      <View style={[styles.container, { paddingHorizontal: 20 }]}>
        {/* Header */}
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, textAlign: 'center', marginTop: 20 }}>
          Scan Your Food
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, textAlign: 'center', marginTop: 4, marginBottom: 24 }}>
          Point your camera at a food item or barcode
        </Text>

        {/* Mode Toggle */}
        <View style={[styles.toggleRow, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.md }]}>
          {(['photo', 'barcode'] as ScanMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.toggleBtn, { backgroundColor: mode === m ? theme.colors.primary : 'transparent', borderRadius: theme.radius.sm }]}
              accessibilityRole="button"
            >
              <Ionicons name={m === 'photo' ? 'camera' : 'barcode'} size={18} color={mode === m ? theme.colors.textInverse : theme.colors.textSecondary} />
              <Text style={{ color: mode === m ? theme.colors.textInverse : theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginLeft: 6 }}>
                {m === 'photo' ? 'Photo' : 'Barcode'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Camera Placeholder */}
        <View style={[styles.camera, { backgroundColor: theme.dark ? '#1A1A18' : '#F0F0EB', borderRadius: theme.radius.xl, borderColor: theme.colors.border }]}>
          {/* Corner markers */}
          {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
            <View key={`${v}-${h}`} style={[styles.corner, { [v]: 20, [h]: 20, borderColor: theme.colors.primary }]} />
          ))}
          <Ionicons name={mode === 'photo' ? 'camera-outline' : 'barcode-outline'} size={56} color={theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 12 }}>
            Camera preview will appear here
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton label="Capture" onPress={handleCapture} icon={<Ionicons name="camera" size={20} color="#FFFFFF" />} />
          <SecondaryButton label="Search Manually" onPress={handleSearch} icon={<Ionicons name="search" size={18} color={theme.colors.primary} />} style={{ marginTop: 12 }} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleRow: { flexDirection: 'row', padding: 4, alignSelf: 'center', marginBottom: 20 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  camera: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 20, minHeight: 280, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderWidth: 3 },
  actions: { marginBottom: 24 },
});
