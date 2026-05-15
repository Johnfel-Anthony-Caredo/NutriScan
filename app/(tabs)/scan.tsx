/**
 * Scan Screen — full-screen camera scanner with overlay controls.
 *
 * Full-screen live camera preview with a centered scan guide frame,
 * top header overlay, and bottom floating control dock.
 * Barcode scanning runs silently in the background.
 */

import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoom, setZoom] = useState(0);

  const zoomLabel =
    zoom === 0 ? '1.0x' : `${(zoom * 2 + 1).toFixed(1)}x`;

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      router.push({
        pathname: '/scan-preview',
        params: { source: 'photo', uri: photo?.uri },
      });
    } catch {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleBarcodeScanned = ({
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;
    setScanned(true);
    router.push({
      pathname: '/scan-preview',
      params: { source: 'barcode', data },
    });
    setTimeout(() => setScanned(false), 2000);
  };

  const toggleFacing = () =>
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

  const toggleFlash = () =>
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));

  const cycleZoom = () =>
    setZoom((z) => (z + 0.5 > 1 ? 0 : z + 0.5));

  const goHome = () => router.replace('/(tabs)');

  // ── Permission states ──────────────────────────────────────────────

  if (!permission) {
    return (
      <View style={[styles.permissionRoot, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body }}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionRoot, { backgroundColor: theme.colors.background }]}>
        <Ionicons
          name="camera-outline"
          size={64}
          color={theme.colors.textTertiary}
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.medium,
            fontFamily: theme.fontFamilies.heading,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[
            styles.permissionBtn,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.md,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: theme.colors.textInverse,
              fontSize: theme.fontSizes.body,
              fontWeight: theme.fontWeights.semibold,
              fontFamily: theme.fontFamilies.body,
            }}
          >
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main camera UI ─────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Full-screen camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        ref={cameraRef}
        flash={flash}
        zoom={zoom}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'qr', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* ── Top overlay ─────────────────────────────────── */}
      <View
        style={[
          styles.topOverlay,
          { paddingTop: insets.top + 10, height: insets.top + 56 },
        ]}
      >
        <TouchableOpacity
          onPress={goHome}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan Food</Text>

        <TouchableOpacity
          onPress={goHome}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Scan guide frame ────────────────────────────── */}
      <View style={styles.guideContainer} pointerEvents="none">
        <View style={styles.guideFrame}>
          {/* Corner markers */}
          <View style={[styles.guideCorner, styles.cornerTL]} />
          <View style={[styles.guideCorner, styles.cornerTR]} />
          <View style={[styles.guideCorner, styles.cornerBL]} />
          <View style={[styles.guideCorner, styles.cornerBR]} />

          {/* Crosshair dot */}
          <View style={styles.crosshair} />
        </View>

        <Text style={styles.guideHint}>Position food in frame</Text>
      </View>

      {/* ── Bottom control panel ────────────────────────── */}
      <View
        style={[
          styles.bottomPanel,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Zoom indicator */}
        <TouchableOpacity onPress={cycleZoom} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Cycle zoom">
          <Text style={styles.zoomLabel}>{zoomLabel}</Text>
        </TouchableOpacity>

        {/* Control row */}
        <View style={styles.controlRow}>
          {/* Secondary: camera flip */}
          <TouchableOpacity
            onPress={toggleFacing}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            onPress={handleCapture}
            style={styles.shutterOuter}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Secondary: flash toggle */}
          <TouchableOpacity
            onPress={toggleFlash}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Flash ${flash === 'on' ? 'on' : 'off'}`}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off-outline'}
              size={24}
              color={flash === 'on' ? '#FFD54F' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const GUIDE_SIZE = 260;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Permission states
  permissionRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 3,
    borderColor: '#0A0A0A',
  },

  // Top overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Scan guide
  guideContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -(GUIDE_SIZE / 2),
    marginTop: -(GUIDE_SIZE / 2 + 20),
    alignItems: 'center',
  },
  guideFrame: {
    width: GUIDE_SIZE,
    height: GUIDE_SIZE,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FFFFFF',
  },
  cornerTL: {
    top: -3,
    left: -3,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: -3,
    right: -3,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: -3,
    left: -3,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: -3,
    right: -3,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  crosshair: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  guideHint: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 14,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  zoomLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },

  // Shutter
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },

  // Secondary buttons
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
