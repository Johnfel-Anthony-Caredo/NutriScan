/**
 * useRefresh — pull-to-refresh state machine hook.
 *
 * States: idle → refreshing → success | error → idle
 * - Locks duplicate refreshes via ref
 * - Provides haptic feedback on refresh start
 * - Auto-dismisses success after a brief moment
 * - Preserves error state until user dismisses or pulls again
 */

import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type RefreshState = 'idle' | 'refreshing' | 'success' | 'error';

interface UseRefreshOptions {
  onRefresh: () => Promise<void>;
}

interface UseRefreshResult {
  refreshState: RefreshState;
  isRefreshing: boolean;
  refreshError: string | null;
  handleRefresh: () => Promise<void>;
  dismissError: () => void;
}

export function useRefresh({ onRefresh }: UseRefreshOptions): UseRefreshResult {
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const lockedRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    setRefreshState('refreshing');
    setRefreshError(null);

    try {
      // Subtle haptic feedback on refresh start (not on web)
      if (Platform.OS !== 'web') {
        try {
          const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
          impactAsync(ImpactFeedbackStyle.Light);
        } catch {
          // haptics not available — silently continue
        }
      }

      await onRefresh();

      setRefreshState('success');
      setTimeout(() => {
        setRefreshState((prev) => (prev === 'success' ? 'idle' : prev));
      }, 800);
    } catch (err: any) {
      setRefreshState('error');
      setRefreshError(err?.message || "Couldn’t refresh. Pull down to try again.");
    } finally {
      lockedRef.current = false;
    }
  }, [onRefresh]);

  const dismissError = useCallback(() => {
    setRefreshError(null);
    setRefreshState('idle');
  }, []);

  return {
    refreshState,
    isRefreshing: refreshState === 'refreshing',
    refreshError,
    handleRefresh,
    dismissError,
  };
}
