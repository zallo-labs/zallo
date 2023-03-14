import { FiatValue } from '~/components/fiat/FiatValue';
import { TokenAmount } from '~/components/token/TokenAmount';
import { FC, memo } from 'react';
import { useTokenValues } from '@token/useTokenValue';
import _ from 'lodash';
import { Transfer } from '@subgraph/transfer';
import { TextProps } from '@theme/types';
import { Address } from 'lib';

export interface ActivityTransfersProps {
  transfers: Transfer[];
  text: FC<TextProps>;
}

export const ActivityTransfers = memo(({ transfers, text: Text }: ActivityTransfersProps) => {
  const values = _.zip(
    transfers,
    useTokenValues(...transfers.map((t): [Address, string] => [t.token.addr, t.amount.toString()])),
  );
  const totalValue = values.reduce((sum, [transfer, value]) => {
    if (!transfer || !value) return sum;

    return sum + value * (transfer.direction === 'IN' ? 1 : -1);
  }, 0);

  return (
    <>
      {transfers.length > 0 && (
        <Text>
          <FiatValue value={Math.abs(totalValue)} />
        </Text>
      )}

      {transfers.map(
        (t) =>
          t.amount !== 0n && (
            <Text key={t.token.addr}>
              <TokenAmount token={t.token} amount={t.amount} />
            </Text>
          ),
      )}
    </>
  );
});
