import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { ProfileProvider } from '@/context/ProfileContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProfileProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan-preview" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="scan-result" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="manual-search" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="nutribot" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="article/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ProfileProvider>
  );
}
