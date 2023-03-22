import { useNavigation } from '@react-navigation/native';
import { Address } from 'lib';
import { useCallback } from 'react';
import { ScanScreenParams } from './ScanScreen';

export const useScanAddress = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: Omit<ScanScreenParams, 'onAddress'>) =>
      new Promise<Address>((resolve) =>
        navigate('Scan', {
          ...params,
          onAddress: resolve,
        }),
      ),
    [navigate],
  );
};
