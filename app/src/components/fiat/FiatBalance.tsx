import { useTotalBalanceValue } from '@token/useTotalBalanceValue';
import { Address } from 'lib';
import { FiatValue } from './FiatValue';

export interface FiatBalanceProps {
  addr?: Address;
  showZero?: boolean;
  rightAffix?: React.ReactNode;
}

export const FiatBalance = ({
  addr,
  showZero,
  rightAffix,
}: FiatBalanceProps) => {
  const totalFiatValue = useTotalBalanceValue(addr);

  if (!showZero && !totalFiatValue) return null;

  return (
    <>
      <FiatValue value={totalFiatValue} />
      {rightAffix}
    </>
  );
};
