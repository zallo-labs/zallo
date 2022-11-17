import { QueryResult } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export const usePollWhenFocussed = (
  { startPolling, stopPolling }: Pick<QueryResult, 'startPolling' | 'stopPolling'>,
  seconds: number,
) =>
  useFocusEffect(
    useCallback(() => {
      startPolling(seconds * 1000);

      return () => stopPolling();
    }, [seconds, startPolling, stopPolling]),
  );
