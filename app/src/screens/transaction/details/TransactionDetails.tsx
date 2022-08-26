import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { Text } from 'react-native-paper';
import { DetailedCallMethod } from './DetailedCallMethod';
import { useCallValues } from '~/components/call/useCallValues';
import { Card } from '~/components/card/Card';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Tx } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { ZERO } from 'lib';
import { TokenAmountRow } from './TokenAmountRow';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { TokenIcon } from '~/components/token/TokenIcon/TokenIcon';

export interface TransactionDetailsProps {
  tx: Tx;
  wallet: CombinedWallet;
}

export const TransactionDetails = ({ tx, wallet }: TransactionDetailsProps) => {
  const token = useMaybeToken(tx.to) ?? ETH;
  const { totalFiat } = useCallValues(tx, token);
  const tokenAmount = useDecodedTransfer(tx)?.value ?? ZERO;

  return (
    <Card>
      <Box horizontal alignItems="center">
        <TokenIcon token={token} />

        <Box flex={1} ml={3}>
          <Text variant="titleMedium">
            <Addr addr={tx.to} />
          </Text>
        </Box>

        {totalFiat > 0 && (
          <Text variant="titleMedium">
            <FiatValue value={totalFiat} />
          </Text>
        )}
      </Box>

      {(!tx.value.isZero() || !tokenAmount.isZero) && (
        <Box mt={2}>
          {!tx.value.isZero() && (
            <TokenAmountRow
              token={ETH}
              amount={tx.value}
              account={wallet.accountAddr}
            />
          )}
          {!tokenAmount.isZero() && (
            <TokenAmountRow
              token={token}
              amount={tokenAmount}
              account={wallet.accountAddr}
            />
          )}
        </Box>
      )}

      <DetailedCallMethod call={tx} />
    </Card>
  );
};
