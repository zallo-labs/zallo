import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { AppState } from 'react-native';
import { showInfo } from './SnackbarProvider';
import { showWarning } from './SnackbarProvider';

const onError = (error: unknown) => {
  showWarning('Failed to download update. You may experience issues.');
  logError('Error encountered during update', { error });
};

export const UpdateProvider = () => {
  useEffect(() => {
    if (__DEV__) return; // Updates don't work in development mode as bundle is always served from server

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
};
