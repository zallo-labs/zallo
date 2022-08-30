import { QueryResult } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export const usePollWhenFocussed = (
  {
    startPolling,
    stopPolling,
  }: Pick<QueryResult, 'startPolling' | 'stopPolling'>,
  interval: number,
) =>
  useFocusEffect(
    useCallback(() => {
      startPolling(interval);

      return () => stopPolling();
    }, [interval, startPolling, stopPolling]),
  );
