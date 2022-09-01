import { Box } from '~/components/layout/Box';
import { BigNumber } from 'ethers';
import { Text } from 'react-native-paper';
import { TokenAmount } from '~/components/token/TokenAmount';
import { Token } from '@token/token';
import { useTxContext } from '../TransactionProvider';
import { makeStyles } from '@theme/makeStyles';
import { useTokenAvailable } from '@token/useTokenAvailable';

export interface TokenAmountRowProps {
  token: Token;
  amount: BigNumber;
}

export const TokenAmountRow = ({ token, amount }: TokenAmountRowProps) => {
  const { wallet } = useTxContext();

  return (
    <Box horizontal justifyContent="space-between" alignItems="center">
      <Text variant="bodyMedium">
        <TokenAmount token={token} amount={amount} />
      </Text>

      <Text variant="bodySmall">
        <TokenAmount token={token} amount={useTokenAvailable(token, wallet)} />
        available
      </Text>
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  insufficient: {
    color: colors.error,
  },
}));
