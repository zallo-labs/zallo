import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { AddrLink } from '~/util/addrLink';
import { ScanScreenParams } from './ScanScreen';

export const useScanAddr = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: Omit<ScanScreenParams, 'onScanAddr'>) =>
      new Promise<AddrLink>((resolve) =>
        navigate('Scan', {
          ...params,
          onScanAddr: resolve,
        }),
      ),
    [navigate],
  );
};
