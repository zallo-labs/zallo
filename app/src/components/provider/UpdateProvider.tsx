import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { showInfo } from './SnackbarProvider';
import { showWarning } from './SnackbarProvider';
import { DateTime } from 'luxon';
import * as Sentry from '@sentry/react-native';

function periodElapsed(lastCheck: Date | undefined) {
  return !lastCheck || DateTime.now() > DateTime.fromJSDate(lastCheck).plus({ minutes: 5 });
}

export function UpdateProvider() {
  const {
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    lastCheckForUpdateTimeSinceRestart,
    checkError,
    downloadError,
  } = Updates.useUpdates();

  // Check for updates:
  // - on launch (default)
  // - on foreground every 5 minutes
  useEffect(() => {
    if (__DEV__ || Platform.OS === 'web') return;

    const listener = AppState.addEventListener('change', async (newState) => {
      if (newState === 'active' && periodElapsed(lastCheckForUpdateTimeSinceRestart))
        Updates.checkForUpdateAsync();
    });

    return () => {
      listener.remove();
    };
  }, [lastCheckForUpdateTimeSinceRestart]);

  // Fetch updates when available
  useEffect(() => {
    if (isUpdateAvailable && !isDownloading) Updates.fetchUpdateAsync();
  }, [isDownloading, isUpdateAvailable]);

  // Prompt user to reload when update is pending
  useEffect(() => {
    if (isUpdatePending) {
      showInfo('A new version is available', {
        action: {
          label: 'Reload',
          onPress: Updates.reloadAsync,
        },
        autoHide: false,
      });
    }
  }, [isUpdatePending]);

  // Breadcrumb checkError
  useEffect(() => {
    if (checkError) {
      Sentry.addBreadcrumb({
        category: 'updates',
        message: 'error checking for updates',
        level: 'warning',
        data: { error: checkError },
      });
    }
  }, [checkError]);

  // Breadcrumb downloadError
  useEffect(() => {
    if (downloadError) {
      Sentry.addBreadcrumb({
        category: 'updates',
        message: 'error downloading update',
        level: 'warning',
        data: { error: downloadError },
      });
      showWarning('Failed to download update. You may experience issues.');
    }
  }, [downloadError]);

  return null;
}
