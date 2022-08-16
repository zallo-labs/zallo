import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback } from 'react';

export const useKeepAwakeWhenFocussed = (tag?: string) =>
  useFocusEffect(
    useCallback(() => {
      activateKeepAwake(tag);
      return () => deactivateKeepAwake(tag);
    }, [tag]),
  );
