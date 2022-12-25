import { QuorumGuid } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useSendToScanned = () => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (quorum: QuorumGuid) => {
      navigate('Scan', {
        onScanAddr: (link) =>
          navigate('Send', {
            quorum,
            to: link.target_address,
          }),
      });
    },
    [navigate],
  );
};
