import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { event } from '~/util/analytics';
import { AppState } from 'react-native';
import { showInfo } from './SnackbarProvider';

const update = async () => {
  try {
    if (__DEV__) return; // Updates don't work in development mode as bundle is always served from server

    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();

      showInfo('Update available', {
        visibilityTime: 10000,
        action: {
          label: 'Apply',
          onPress: () => {
            Updates.reloadAsync();
          },
        },
      });
    }
  } catch (error) {
    event({ level: 'error', message: 'Error encountered during update', error });
  }
};

export const UpdateProvider = () => {
  useEffect(() => {
    // On app start
    update();

    // On app foreground
    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') update();
    });

    return () => {
      listener.remove();
    };
  }, []);

  return null;
};
