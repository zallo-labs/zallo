import { Box } from '@components/Box';
import { TokenValue } from '@components/token/TokenValue';
import { useContractMethod } from '~/queries/useContractMethod';
import { Caption, Paragraph, useTheme } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { TransferMethodValue } from './TransferMethodValue';
import { useDecodedTransfer } from './useDecodedTransfer';
import { Addr } from '@components/Addr';
import { Call } from 'lib';

export interface CallRowProps {
  call: Call;
}

export const CallRow = ({ call: { to, value, data } }: CallRowProps) => {
  const { colors } = useTheme();
  const { methodName } = useContractMethod(to, data);
  const decodedTransfer = useDecodedTransfer(to, data);

  return (
    <Box horizontal justifyContent="space-between">
      <Caption style={{ fontSize: 15, marginVertical: 0 }}>
        {decodedTransfer ? (
          <>
            {`transfer to `}
            <Addr addr={decodedTransfer.to} />
          </>
        ) : (
          methodName
        )}
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
