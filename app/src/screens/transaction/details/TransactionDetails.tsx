import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { Text } from 'react-native-paper';
import { DetailedCallMethod } from './method/DetailedCallMethod';
import { Card } from '~/components/card/Card';
import { FiatValue } from '~/components/fiat/FiatValue';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { TokenIcon } from '~/components/token/TokenIcon/TokenIcon';
import { useTxContext } from '../TransactionProvider';
import { makeStyles } from '@theme/makeStyles';
import { TxTransfers } from './TxTransfers';
import { useTxTransfers } from './useTxTransfers';

export const TransactionDetails = () => {
  const styles = useStyles();
  const { proposal: tx } = useTxContext();
  const token = useMaybeToken(tx.to) ?? ETH;

  const transfers = useTxTransfers(tx);
  const totalFiat = transfers.reduce((acc, t) => acc + t.fiatAmount, 0);

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

      <TxTransfers tx={tx} transfers={transfers} style={styles.section} />

      <DetailedCallMethod call={tx} style={styles.section} />
    </Card>
  );
};

const useStyles = makeStyles(({ space }) => ({
  section: {
    marginTop: space(1),
  },
}));
