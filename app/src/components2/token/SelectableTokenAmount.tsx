import { useNavigation } from '@react-navigation/native';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { TokenAmountCard } from './TokenAmountCard';
import { useSelectedToken } from './useSelectedToken';

export interface SelectableTokenAmountProps {
  amount: BigNumber;
  onChange: (amount?: BigNumber) => void;
}

export const SelectableTokenAmount = ({
  amount,
  onChange,
}: SelectableTokenAmountProps) => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();
  const token = useSelectedToken();

  const handlePress = useCallback(
    () =>
      navigation.push('Amount', {
        onChange: onChange,
      }),
    [navigation, onChange],
  );

  return (
    <TokenAmountCard token={token} amount={amount} onPress={handlePress} />
  );
};
