import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { Addr } from '@components/Addr';
import { Item, ItemProps } from '@components/list/Item';
import { TokenIcon } from '@components/token/TokenIcon';
import { Paragraph, Subheading } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { useTokenValue } from '~/token/useTokenValue';
import { Address, sumBn } from 'lib';
import { TxOpRow } from './TxOpRow';
import { OpWithHash } from '@gql/queries/useTxs';
import { ethers } from 'ethers';
import { useToken } from '~/token/useToken';

export interface OpsGroup {
  to: Address;
  ops: OpWithHash[];
}

export interface TxOpsGroupItemProps extends ItemProps {
  group: OpsGroup;
}

export const TxOpsGroupItem = ({
  group: { to, ops },
  ...itemProps
}: TxOpsGroupItemProps) => {
  const token = useToken(to) ?? ETH;
  const { fiatValue } = useTokenValue(token, sumBn(ops.map((op) => op.value)));

  return (
    <Item
      Left={<TokenIcon token={token} />}
      Main={
        <Box vertical justifyContent="space-between">
          <Box horizontal justifyContent="space-between">
            <Subheading style={{ fontSize: 20, marginVertical: 0 }}>
              <Addr addr={to} />
            </Subheading>

            <Paragraph>
              <FiatValue value={fiatValue} />
            </Paragraph>
          </Box>

          {ops.map((op) => (
            <TxOpRow key={ethers.utils.hexlify(op.hash)} op={op} />
          ))}
        </Box>
      }
      {...itemProps}
    />
  );
};
