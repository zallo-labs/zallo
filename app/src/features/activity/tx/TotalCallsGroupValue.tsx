import { FiatValue } from '~/components2/fiat/FiatValue';
import { Address, sumBn, ZERO, mapAsync, Call } from 'lib';
import { useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { useLazyContractMethod } from '~/queries/useContractMethod.api';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { ETH } from '~/token/tokens';
import { useMaybeToken } from '~/token/useToken';
import { getTokenValue, TokenValue } from '~/token/useTokenValue';
import { tryDecodeTransfer } from './useDecodedTransfer';

export interface TotalCallsGroupValueProps {
  to: Address;
  calls: Call[];
  hideZero?: boolean;
}

export const TotalCallsGroupValue = ({
  to,
  calls,
  hideZero,
}: TotalCallsGroupValueProps) => {
  const getContractMethod = useLazyContractMethod();
  const token = useMaybeToken(to) ?? ETH;
  const { price } = useTokenPrice(token);

  const [value, setValue] = useState<TokenValue>({ fiatValue: 0, ethValue: 0 });

  useAsyncEffect(async (isMounted) => {
    const values = await mapAsync(calls, async (call) => {
      const { methodFragment, methodInterface } = await getContractMethod(
        call.to,
        call.data,
      );

      const decoded = tryDecodeTransfer(
        call.data,
        methodFragment,
        methodInterface,
      );
      return decoded?.value ?? ZERO;
    });

    const newValue = getTokenValue(token, sumBn(values), price);
    if (isMounted()) setValue(newValue);
  }, []);

  if (hideZero && !value.fiatValue) return null;

  return <FiatValue value={value.fiatValue} />;
};
