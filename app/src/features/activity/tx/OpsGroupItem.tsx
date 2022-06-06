import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { Addr } from '@components/Addr';
import { Item, ItemProps } from '@components/list/Item';
import { TokenIcon } from '@components/token/TokenIcon';
import { Paragraph, Subheading } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { useTokenValue } from '~/token/useTokenValue';
import { Address, Op, sumBn } from 'lib';
import { OpRow } from './TxOpRow';
import { OpWithHash } from '@gql/queries/useTxs';
import { ethers } from 'ethers';
import { useToken } from '~/token/useToken';
import { TotalOpsGroupValue } from './TotalOpsGroupValue';

export interface OpsGroup {
  to: Address;
  ops: OpWithHash[];
}

export interface OpsGroupItemProps extends ItemProps {
  group: OpsGroup;
}

export const OpsGroupItem = ({
  group: { to, ops },
  ...itemProps
}: OpsGroupItemProps) => {
  const token = useToken(to) ?? ETH;

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
              <TotalOpsGroupValue to={to} ops={ops} />
            </Paragraph>
          </Box>

          {ops.map((op) => (
            <OpRow key={ethers.utils.hexlify(op.hash)} op={op} />
          ))}
        </Box>
      }
      {...itemProps}
    />
  );
};
