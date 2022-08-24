import { Box } from '~/components/layout/Box';
import { BigNumber } from 'ethers';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { TokenAmount } from '~/components/token/TokenAmount';
import { Token } from '@token/token';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';

export interface TokenAmountRowProps {
  token: Token;
  amount: BigNumber;
  account: Address;
}

export const TokenAmountRow = ({
  token,
  amount,
  account,
}: TokenAmountRowProps) => {
  const balance = useTokenBalance(token, account);
  const balanecValue = useTokenValue(token, balance);

  return (
    <Box horizontal justifyContent="space-between" alignItems="center">
      <Text variant="bodyMedium">
        <TokenAmount token={token} amount={amount} />
      </Text>

      <Text variant="bodySmall">
        <FiatValue value={balanecValue.fiatValue} />
      </Text>
    </Box>
  );
};
