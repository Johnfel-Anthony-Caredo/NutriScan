import { Redirect } from 'expo-router';
import { useProfile } from '@/context/ProfileContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * App entry point — decides where to route the user.
 *
 * Routes based on profile hydration:
 * - Not hydrated yet → loading spinner
 * - No onboarding completed → onboarding welcome
 * - Onboarding completed → main tabs
 */
export default function Index() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0D9B8A" />
      </View>
    );
  }

  if (!profile.onboardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
