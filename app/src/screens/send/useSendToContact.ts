import { QuorumGuid } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useSendToContact = () => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (quorum: QuorumGuid) => {
      navigate('Contacts', {
        onSelect: (contact) =>
          navigate('Send', {
            quorum,
            to: contact.addr,
          }),
      });
    },
    [navigate],
  );
};
