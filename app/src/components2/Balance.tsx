import { FiatValue } from '@components/FiatValue';
import { Address } from 'lib';
import { useTokenValues } from '~/token/useTokenValues';

export interface BalanceProps {
  addr: Address;
}

export const Balance = ({ addr }: BalanceProps) => {
  const { totalFiatValue } = useTokenValues(addr);

  return <FiatValue value={totalFiatValue} />;
};
