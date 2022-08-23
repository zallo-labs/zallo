import { useCallback } from 'react';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedWallet } from '~/queries/wallets';
import { createTransferTx } from '@token/token';

export const useSendToContact = (wallet: CombinedWallet) => {
  const { navigate } = useRootNavigation();
  const token = useSelectedToken();
  const propose = useProposeTx(wallet);

  return useCallback(() => {
    navigate('Contacts', {
      onSelect: (contact) => {
        navigate('Amount', {
          onChange: (amount) => {
            if (amount) propose(createTransferTx(token, contact.addr, amount));
          },
        });
      },
    });
  }, [navigate, propose, token]);
};
