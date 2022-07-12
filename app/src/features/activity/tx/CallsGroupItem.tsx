import { Box } from '@components/Box';
import { Addr } from '@components/Addr';
import { Item, ItemProps } from '@components/list/Item';
import { TokenIcon } from '@components/token/TokenIcon';
import { Paragraph, Subheading, useTheme } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { Address, Call } from 'lib';
import { CallRow } from './CallRow';
import { useToken } from '~/token/useToken';
import { TotalCallsGroupValue } from './TotalCallsGroupValue';

export interface CallsGroup {
  to: Address;
  calls: Call[];
}

export interface CallsGroupItemProps extends ItemProps {
  group: CallsGroup;
}

export const CallsGroupItem = ({
  group: { to, calls },
  ...itemProps
}: CallsGroupItemProps) => {
  const { colors } = useTheme();
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

            <Paragraph style={{ color: colors.lighterText }}>
              <TotalCallsGroupValue to={to} calls={calls} hideZero />
            </Paragraph>
          </Box>

          {calls.map((op, i) => (
            <CallRow key={i} call={op} />
          ))}
        </Box>
      }
      {...itemProps}
    />
  );
};
