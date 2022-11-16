import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { TokenAmountCard } from './TokenAmountCard';
import { useSelectedToken } from './useSelectedToken';

export interface SelectableTokenAmountCardProps {
  amount: BigNumber;
  onChange: (amount?: BigNumber) => void;
}

export const SelectableTokenAmountCard = ({ amount, onChange }: SelectableTokenAmountCardProps) => {
  const navigation = useRootNavigation();
  const token = useSelectedToken();

  const handlePress = useCallback(
    () =>
      navigation.navigate('Amount', {
        onChange,
      }),
    [navigation, onChange],
  );

  return <TokenAmountCard token={token} amount={amount} onPress={handlePress} />;
};
