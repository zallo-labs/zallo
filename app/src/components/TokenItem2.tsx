import { Tokenlike, useToken } from '@token/useToken';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { AccountIdlike } from '@api/account';
import { useTokenPrice } from '@uniswap/useTokenPrice';
import { FiatValue } from './fiat/FiatValue';
import { Percent } from './format/Percent';
import { Box } from './layout/Box';
import { ListItem, ListItemProps } from './list/ListItem';
import { TokenAmount } from './token/TokenAmount';

export interface TokenItem2Props extends Partial<ListItemProps> {
  token: Tokenlike;
  account?: AccountIdlike;
}

export const TokenItem2 = ({ token: tokenAddr, account, ...itemProps }: TokenItem2Props) => {
  const token = useToken(tokenAddr);
  const balance = useTokenBalance(token, account);
  const balanceValue = useTokenValue(token, balance);
  const price = useTokenPrice(token);

  return (
    <ListItem
      leading={token.addr}
      headline={<TokenAmount token={token} amount={balance} trailing="name" />}
      supporting={<FiatValue value={balanceValue} />}
      trailing={({ Text }) => (
        <Box>
          <Text variant="labelMedium">
            <FiatValue value={price.current} />
          </Text>

          {price.change !== 0 && (
            <Text variant="bodySmall">
              <Percent value={price.change} />
            </Text>
          )}
        </Box>
      )}
      {...itemProps}
    />
  );
};
