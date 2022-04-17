import { useMemo } from 'react';
import { Caption, Paragraph, Subheading, useTheme } from 'react-native-paper';
import { BigNumber, ethers } from 'ethers';

import { ListItem } from '@components/ListItem';
import { Token } from '~/token/token';
import { TokenIcon } from '@components/token/TokenIcon';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenPrice } from '@gql/queries/useTokenPrice';
import { Box } from '@components/Box';
import { PriceDelta } from '@components/PriceDelta';
import { TokenValue } from '@components/token/TokenValue';
import { FiatValue } from '@components/FiatValue';
import { FIAT_DECIMALS } from '~/token/fiat';

export interface TokenItemProps {
  token: Token;
}

export const TokenHolding = ({ token }: TokenItemProps) => {
  const { colors } = useTheme();
  const { balance } = useTokenBalance(token);
  const { price } = useTokenPrice(token);

  const fiatBalance = useMemo(
    () => ethers.utils.formatUnits(balance.mul(price.current), token.decimals + FIAT_DECIMALS),
    [token, balance, price.current],
  );

  return (
    <ListItem
      Left={<TokenIcon token={token} />}
      Main={
        <Box vertical justifyContent="space-around">
          <Subheading>{token.name}</Subheading>
          <Paragraph style={{ color: colors.lighterText }}>
            <TokenValue token={token} value={balance} />
          </Paragraph>
        </Box>
      }
      Right={
        <Box vertical alignItems="flex-end">
          <Paragraph>
            <FiatValue value={fiatBalance} />
          </Paragraph>
          <PriceDelta delta={price.delta} />
        </Box>
      }
    />
  );
};
