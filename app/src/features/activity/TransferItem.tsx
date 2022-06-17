import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { Addr } from '@components/Addr';
import { Item, ItemProps } from '@components/list/Item';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { Caption, Paragraph, Subheading, useTheme } from 'react-native-paper';
import { useToken } from '~/token/useToken';
import { useTokenValue } from '~/token/useTokenValue';
import { isInTransfer, Transfer } from '~/queries/tx/transfer';

export interface TransferItemProps extends ItemProps {
  transfer: Transfer;
}

export const TransferItem = ({
  transfer: t,
  ...itemProps
}: TransferItemProps) => {
  const { colors } = useTheme();
  const token = useToken(t.tokenAddr);
  const { fiatValue } = useTokenValue(token, t.value);

  return (
    <Item
      Left={<TokenIcon token={token} />}
      Main={
        <Box vertical justifyContent="space-between">
          <Subheading style={{ fontSize: 20, marginVertical: 0 }}>
            <Addr addr={t.tokenAddr} />
          </Subheading>

          <Caption style={{ fontSize: 15, marginVertical: 0 }}>
            {`transfer ${isInTransfer(t) ? 'from' : 'to'} `}
            <Addr addr={t.addr} />
          </Caption>
        </Box>
      }
      Right={
        <Box vertical alignItems="flex-end">
          <Paragraph style={{ color: colors.lighterText }}>
            <FiatValue value={fiatValue} />
          </Paragraph>

          <Paragraph
            style={{
              ...(!t.value.eq(0) && {
                color: isInTransfer(t) ? colors.success : colors.error,
              }),
            }}
          >
            <TokenValue token={token} value={t.value} />
          </Paragraph>
        </Box>
      }
      {...itemProps}
    />
  );
};
