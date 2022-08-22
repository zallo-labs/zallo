import { gql } from '@apollo/client';
import { showInfo } from '@components/ToastProvider';
import { useRequestFundsMutation } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { parseEther } from 'ethers/lib/utils';
import { Address } from 'lib';
import { useCallback } from 'react';
import { CHAIN } from '~/provider';
import { ETH } from '~/token/tokens';
import {
  useTokenBalance,
  useUpdateTokenBalance,
} from '~/token/useTokenBalance';

const FUND_BELOW_BALANCE = parseEther('0.01');

gql`
  mutation RequestFunds($recipient: Address!) {
    requestFunds(recipient: $recipient)
  }
`;

export const useFaucet = (recipient?: Address, displayMessage?: boolean) => {
  const [mutation] = useRequestFundsMutation({
    client: useApiClient(),
    variables: { recipient: recipient ?? '' },
  });
  const balance = useTokenBalance(ETH, recipient);
  const updateBalance = useUpdateTokenBalance(ETH, recipient);

  const receive = useCallback(async () => {
    if (displayMessage)
      showInfo({
        text1: 'Requesting funds from faucet...',
        autoHide: false,
      });

    await mutation();
    await updateBalance();

    if (displayMessage) showInfo('Funds received');
  }, [displayMessage, mutation, updateBalance]);

  return CHAIN.isTestnet && recipient && balance?.lt?.(FUND_BELOW_BALANCE)
    ? receive
    : undefined;
};
