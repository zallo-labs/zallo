import { useMemo } from 'react';
import { Caption, Paragraph, Subheading } from 'react-native-paper';
import { ethers } from 'ethers';

import { ListItem } from '@components/ListItem';
import { Token } from '@features/token/token';
import { TokenIcon } from '@components/token/TokenIcon';
import { useTokenBalance } from '@features/token/useTokenBalance';
import { useTokenPrice } from '@gql/queries/useTokenPrice';
import { Box } from '@components/Box';
import { PriceDelta } from '@components/PriceDelta';
import { TokenValue } from '@components/token/TokenValue';
import { FiatValue } from '@components/FiatValue';

export interface TokenItemProps {
  token: Token;
}

export const TokenHolding = ({ token }: TokenItemProps) => {
  const balance = useTokenBalance(token);
  const {
    price: { current: price, delta },
  } = useTokenPrice(token);

  const fiatValue = useMemo(
    () => ethers.utils.formatUnits(balance.mul(price.toFixed(0)), token.decimals),
    [token, balance, price],
  );

  return (
    <ListItem
      Left={<TokenIcon token={token} />}
      Main={
        <Box vertical justifyContent="space-around">
          <Subheading>{token.name}</Subheading>
          <Caption>
            <TokenValue token={token} value={balance} />
          </Caption>
        </Box>
      }
      Right={
        <Box vertical alignItems="flex-end">
          <Paragraph>
            <FiatValue value={fiatValue} />
          </Paragraph>
          <PriceDelta delta={delta} />
        </Box>
      }
    />
  );
};
