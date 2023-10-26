import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { AppState } from 'react-native';
import { showInfo } from './SnackbarProvider';
import { showWarning } from './SnackbarProvider';
import { __WEB__ } from '~/util/config';

const onError = (error: unknown) => {
  showWarning('Failed to download update. You may experience issues.');
  logError('Error encountered during update', { error });
};

export function UpdateProvider() {
  useEffect(() => {
    if (__DEV__ || __WEB__) return;

    const onStartUpdateListener = Updates.addListener((e) => {
      if (e.type === Updates.UpdateEventType.UPDATE_AVAILABLE) {
        // Update without prompting user
        Updates.reloadAsync();
      } else if (e.type === Updates.UpdateEventType.ERROR) {
        onError(new Error(e.message));
      }
    });

    // On app foreground
    const appStateListener = AppState.addEventListener('change', async (newState) => {
      if (newState === 'active') {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            showInfo('Updating...', { autoHide: false });
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (error) {
          onError(error);
        }
      }
    });

    return () => {
      onStartUpdateListener.remove();
      appStateListener.remove();
    };
  }, []);

  return null;
}
