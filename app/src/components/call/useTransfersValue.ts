import { Transfer } from '@api/transfer';
import { useTokenValues } from '@token/useTokenValue';
import { Address } from 'lib';
import _ from 'lodash';

export const useTransfersValue = (transfers: Transfer[]) => {
  const values = _.zip(
    transfers,
    useTokenValues(...transfers.map((t): [Address, string] => [t.token, t.amount.toString()])),
  );

  return values.reduce((sum, [transfer, value]) => {
    if (!transfer || !value) return sum;

    return sum + value;
  }, 0);
};
