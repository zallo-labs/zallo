import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { showInfo, showWarning } from '#/Snackbar';

const UPDATE_INTEVAL = 5 * 60_000;

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
  // - when app enters foreground
  // - every 5 minutes
  useEffect(() => {
    if (!Updates.isEnabled) return;

    const checkStale = () =>
      !lastCheckForUpdateTimeSinceRestart ||
      lastCheckForUpdateTimeSinceRestart.getTime() + UPDATE_INTEVAL < Date.now();

    const listener = AppState.addEventListener('change', async (newState) => {
      if (newState === 'active' && checkStale()) Updates.checkForUpdateAsync();
    });

    const timer = setInterval(() => {
      if (checkStale()) Updates.checkForUpdateAsync();
    }, UPDATE_INTEVAL);

    return () => {
      listener.remove();
      clearTimeout(timer);
    };
  }, [lastCheckForUpdateTimeSinceRestart]);

  // Fetch updates when available
  useEffect(() => {
    if (isUpdateAvailable && !isDownloading) Updates.fetchUpdateAsync();
  }, [isDownloading, isUpdateAvailable]);

  // Prompt user to reload when update is pending
  useEffect(() => {
    if (isUpdatePending) {
      showInfo('Update available', { action: 'Reload', duration: Infinity }).then((confirmed) => {
        confirmed && Updates.reloadAsync();
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
