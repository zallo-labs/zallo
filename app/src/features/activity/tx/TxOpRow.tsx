import { Box } from '@components/Box';
import { TokenValue } from '@components/token/TokenValue';
import { useContractMethod } from '~/queries/useContractMethod';
import { Op } from 'lib';
import { Caption, Paragraph, useTheme } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { TransferMethodValue } from './TransferMethodValue';

export interface OpRowProps {
  op: Op;
}

export const OpRow = ({ op: { to, value, data } }: OpRowProps) => {
  const { colors } = useTheme();
  const { methodName } = useContractMethod(to, data);

  return (
    <Box horizontal justifyContent="space-between">
      <Caption style={{ fontSize: 15, marginVertical: 0 }}>
        {methodName}
      </Caption>

      <Box vertical alignItems="flex-end">
        {value.gt(0) && (
          <Paragraph style={{ color: colors.error }}>
            <TokenValue token={ETH} value={value} />
          </Paragraph>
        )}

        <Paragraph style={{ color: colors.error }}>
          <TransferMethodValue to={to} data={data} />
        </Paragraph>
      </Box>
    </Box>
  );
};
