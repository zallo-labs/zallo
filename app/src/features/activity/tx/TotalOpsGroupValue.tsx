import { FiatValue } from '@components/FiatValue';
import { useLazyContractMethod } from '~/queries/useContractMethod';
import { useTokenPrice } from '~/queries';
import { BigNumber } from 'ethers';
import { Address, Op, sumBn, ZERO } from 'lib';
import { useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { ETH } from '~/token/tokens';
import { useToken } from '~/token/useToken';
import { getTokenValue, TokenValue } from '~/token/useTokenValue';
import { TRANSFER_METHOD_SIGHASH } from './TransferMethodValue';

export interface TotalOpsGroupValueProps {
  to: Address;
  ops: Op[];
}

export const TotalOpsGroupValue = ({ to, ops }: TotalOpsGroupValueProps) => {
  const getContractMethod = useLazyContractMethod();
  const token = useToken(to) ?? ETH;
  const { price } = useTokenPrice(token);

  const [value, setValue] = useState<TokenValue>({ fiatValue: 0, ethValue: 0 });

  useAsyncEffect(async () => {
    // get all method fragments
    const methods = await Promise.all(
      ops.map(async (op) => ({
        op,
        ...(await getContractMethod(op.to, op.data)),
      })),
    );

    // extract token values from each
    const values = methods.map(
      ({ op, methodInterface, methodFragment, sighash }) => {
        if (sighash !== TRANSFER_METHOD_SIGHASH) return ZERO;

        return methodInterface.decodeFunctionData(
          methodFragment,
          op.data,
        )[1] as BigNumber;
      },
    );
    const sum = sumBn(values);

    setValue(getTokenValue(token, sum, price));
  }, []);

  return <FiatValue value={value.fiatValue} />;
};
