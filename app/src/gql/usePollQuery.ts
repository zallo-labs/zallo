import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { UseQueryExecute } from 'urql';

export const usePollQuery = (reexecute: UseQueryExecute, ms: number) =>
  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => reexecute({ requestPolicy: 'network-only' }), ms);

      return () => clearInterval(timer);
    }, [ms, reexecute]),
  );
