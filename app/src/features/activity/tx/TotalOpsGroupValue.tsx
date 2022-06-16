import { FiatValue } from '@components/FiatValue';
import { useLazyContractMethod } from '~/queries/useContractMethod';
import { useTokenPrice } from '~/queries';
import { Address, Op, sumBn, ZERO, mapAsync } from 'lib';
import { useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { ETH } from '~/token/tokens';
import { useToken } from '~/token/useToken';
import { getTokenValue, TokenValue } from '~/token/useTokenValue';
import { tryDecodeTransfer } from './useDecodedTransfer';

export interface TotalOpsGroupValueProps {
  to: Address;
  ops: Op[];
  hideZero?: boolean;
}

export const TotalOpsGroupValue = ({
  to,
  ops,
  hideZero,
}: TotalOpsGroupValueProps) => {
  const getContractMethod = useLazyContractMethod();
  const token = useToken(to) ?? ETH;
  const { price } = useTokenPrice(token);

  const [value, setValue] = useState<TokenValue>({ fiatValue: 0, ethValue: 0 });

  useAsyncEffect(async (isMounted) => {
    const values = await mapAsync(ops, async (op) => {
      const { methodFragment, methodInterface } = await getContractMethod(
        op.to,
        op.data,
      );

      const decoded = tryDecodeTransfer(
        op.data,
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
