import { Paragraph, Subheading, useTheme } from 'react-native-paper';

import { Item } from '@components/list/Item';
import { Token } from '~/token/token';
import { TokenIcon } from '@components/token/TokenIcon';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenPrice } from '@gql/queries/useTokenPrice';
import { Box } from '@components/Box';
import { PriceDelta } from '@components/PriceDelta';
import { TokenValue } from '@components/token/TokenValue';
import { FiatValue } from '@components/FiatValue';

export interface HoldingProps {
  token: Token;
}

export const Holding = ({ token }: HoldingProps) => {
  const { colors } = useTheme();
  const { balance, fiatValue } = useTokenBalance(token);
  const { price } = useTokenPrice(token);

  return (
    <Item
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
            <FiatValue value={fiatValue} />
          </Paragraph>
          <PriceDelta delta={price.delta} />
        </Box>
      }
    />
  );
};
