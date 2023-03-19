import { useTotalValue } from '@token/useTotalValue';
import { Address } from 'lib';
import { FiatValue } from './FiatValue';

export interface FiatBalanceProps {
  addr?: Address;
  showZero?: boolean;
  rightAffix?: React.ReactNode;
}

export const FiatBalance = ({ addr, showZero, rightAffix }: FiatBalanceProps) => {
  const totalFiatValue = useTotalValue(addr);

  if (!showZero && !totalFiatValue) return null;

  return (
    <>
      <FiatValue value={totalFiatValue} />
      {rightAffix}
    </>
  );
};
