import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScanScreenParams, SCAN_ADDRESS_EMITTER } from './ScanScreen';

export const useScanAddress = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: Omit<ScanScreenParams, 'emitAddress'>) => {
      const p = SCAN_ADDRESS_EMITTER.getEvent();
      navigate('Scan', {
        ...params,
        emitAddress: true,
      });

      return p;
    },
    [navigate],
  );
};
