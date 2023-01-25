import { FiatValue } from '~/components/fiat/FiatValue';
import { TextProps } from 'react-native-paper';
import { TokenAmount } from '~/components/token/TokenAmount';
import { FC, memo } from 'react';
import { useTokenValues } from '@token/useTokenValue';
import { Address } from 'lib';
import { BigNumber } from 'ethers';
import _ from 'lodash';
import { Transfer } from '~/queries/transfer/useTransfer.sub';

export interface ActivityTransfersProps {
  transfers: Transfer[];
  text: FC<TextProps>;
}

export const ActivityTransfers = memo(({ transfers, text: Text }: ActivityTransfersProps) => {
  const values = _.zip(
    transfers,
    useTokenValues(...transfers.map((t): [Address, BigNumber] => [t.token.addr, t.amount])),
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
          !t.amount.isZero() && (
            <Text key={t.token.addr}>
              <TokenAmount token={t.token} amount={t.amount} />
            </Text>
          ),
      )}
    </>
  );
});
