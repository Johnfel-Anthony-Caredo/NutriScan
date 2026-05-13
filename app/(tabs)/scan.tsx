/**
 * Scan Screen — camera scan hub with Photo/Barcode toggle.
 *
 * Full-screen focused scanner. Capture sends to preview,
 * manual search opens the search modal.
 */

import { AppScreen, PrimaryButton, SecondaryButton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type ScanMode = 'photo' | 'barcode';

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>('photo');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [scanned, setScanned] = useState(false);

  // Reset scanned state when returning to the screen or changing modes
  useEffect(() => {
    setScanned(false);
  }, [mode]);

  const handleCapture = async () => {
    if (mode === 'photo') {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
          router.push({ pathname: '/scan-preview', params: { source: 'photo', uri: photo?.uri } });
        } catch (error) {
          Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
      }
    }
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (mode === 'barcode' && !scanned) {
      setScanned(true);
      router.push({ pathname: '/scan-preview', params: { source: 'barcode', data } });
      
      // Allow scanning again after 2 seconds
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const handleSearch = () => {
    router.push('/manual-search');
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <AppScreen noPadding>
        <View style={[styles.container, { paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }]}>
           <Text style={{ color: theme.colors.textSecondary }}>Requesting camera permission...</Text>
        </View>
      </AppScreen>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <AppScreen noPadding>
        <View style={[styles.container, { paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="camera-outline" size={64} color={theme.colors.textTertiary} style={{ marginBottom: 16 }} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.medium, textAlign: 'center', marginBottom: 12 }}>
            We need your permission to show the camera
          </Text>
          <PrimaryButton label="Grant Permission" onPress={requestPermission} />
        </View>
      </AppScreen>
    );
  }

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

        {/* Camera */}
        <View style={[styles.cameraContainer, { borderRadius: theme.radius.lg, borderColor: theme.colors.border }]}>
          <CameraView 
            style={StyleSheet.absoluteFillObject} 
            facing="back"
            ref={cameraRef}
            barcodeScannerSettings={mode === 'barcode' ? { barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e"] } : undefined}
            onBarcodeScanned={mode === 'barcode' ? handleBarcodeScanned : undefined}
          />
          {/* Corner markers */}
          {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
            <View key={`${v}-${h}`} style={[styles.corner, { [v]: 20, [h]: 20, borderColor: theme.colors.primary }]} />
          ))}
          {mode === 'barcode' && (
            <View style={styles.barcodeTarget}>
              <View style={[styles.barcodeLine, { backgroundColor: theme.colors.primary }]} />
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {mode === 'photo' ? (
            <PrimaryButton label="Capture" onPress={handleCapture} icon={<Ionicons name="camera" size={20} color="#FFFFFF" />} />
          ) : (
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 12, marginBottom: 4 }}>
              Looking for barcodes...
            </Text>
          )}
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
  cameraContainer: { flex: 1, overflow: 'hidden', borderWidth: 3, marginBottom: 20, minHeight: 280, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderWidth: 3, zIndex: 2 },
  barcodeTarget: {
    position: 'absolute',
    top: '30%',
    bottom: '30%',
    left: '15%',
    right: '15%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    zIndex: 1,
  },
  barcodeLine: {
    height: 2,
    width: '100%',
    opacity: 0.5,
  },
  actions: { marginBottom: 24 },
});
