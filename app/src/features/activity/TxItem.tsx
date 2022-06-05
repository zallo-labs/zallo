import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { Addr } from '@components/Addr';
import { Item, ItemProps } from '@components/list/Item';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { getSighash, useContractMethod } from '@gql/queries/useContractMethod';
import { Tx } from '@gql/queries/useTxs';
import { Caption, Paragraph, Subheading, useTheme } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { useTokenValue } from '~/token/useTokenValue';
import { sumBn } from "lib";

const token = ETH;

export interface TxItemProps extends ItemProps {
  tx: Tx;
}

export const TxItem = ({ tx, ...itemProps }: TxItemProps) => {
  const { colors } = useTheme();
  const { fiatValue } = useTokenValue(token, sumBn(tx.ops.map(op => op.value)));
  const { methodFragment } = useContractMethod(tx.ops[0].to, tx.ops[0].data);

  const methodName = methodFragment?.name ?? getSighash(tx.ops[0].data);

  return (
    <Item
      Left={<TokenIcon token={token} />}
      Main={
        <Box vertical justifyContent="space-between">
          <Subheading style={{ fontSize: 20, marginVertical: 0 }}>
            <Addr addr={tx.ops[0].to} />
          </Subheading>

          <Caption style={{ fontSize: 15, marginVertical: 0 }}>
            {methodName}
          </Caption>
        </Box>
      }
      Right={
        <Box vertical alignItems="flex-end">
          <Paragraph>
            <FiatValue value={fiatValue} />
          </Paragraph>

          <Paragraph
            style={{
              ...(!tx.ops[0].value.eq(0) && { color: colors.success }),
            }}
          >
            <TokenValue token={token} value={tx.ops[0].value} />
          </Paragraph>
        </Box>
      }
      {...itemProps}
    />
  );
};
