import { Box } from '@components/Box';
import { FiatValue } from '~/components2/fiat/FiatValue';
import { Item, ItemProps } from '@components/list/Item';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { Subheading, Paragraph, useTheme } from 'react-native-paper';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenValue } from '~/token/useTokenValue';

export interface SelectTokenItemProps extends ItemProps {
  token: Token;
}

export const SelectTokenItem = ({
  token,
  ...itemProps
}: SelectTokenItemProps) => {
  const { colors } = useTheme();
  const balance = useTokenBalance(token);
  const { fiatValue } = useTokenValue(token, balance);

  return (
    <Item
      Left={<TokenIcon token={token} />}
      Main={
        <Box vertical justifyContent="space-around">
          <Subheading>{token.name}</Subheading>
        </Box>
      }
      Right={
        <Box vertical alignItems="flex-end">
          <Paragraph style={{ color: colors.lighterText }}>
            <FiatValue value={fiatValue} />
          </Paragraph>
          <Paragraph>
            <TokenValue token={token} value={balance} />
          </Paragraph>
        </Box>
      }
      {...itemProps}
    />
  );
};
