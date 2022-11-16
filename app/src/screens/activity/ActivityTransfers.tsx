import { FiatValue } from '~/components/fiat/FiatValue';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { TokenAmount } from '~/components/token/TokenAmount';
import { memo } from 'react';
import { useTokenValues } from '@token/useTokenValue';
import { Address } from 'lib';
import { BigNumber } from 'ethers';
import _ from 'lodash';
import { Transfer } from '~/queries/transfer/useTransfer.sub';
import { TransferType } from '~/gql/generated.sub';
import { makeStyles } from '@theme/makeStyles';

export interface CallTokensProps {
  transfers: Transfer[];
  textStyle?: StyleProp<TextStyle>;
}

export const ActivityTransfers = memo(({ transfers, textStyle }: CallTokensProps) => {
  const styles = useStyles();

  const values = _.zip(
    transfers,
    useTokenValues(...transfers.map((t): [Address, BigNumber] => [t.token.addr, t.amount])),
  );
  const totalValue = values.reduce((sum, [transfer, value]) => {
    if (!transfer || !value) return sum;

    return sum + value * (transfer.direction === TransferType.In ? 1 : -1);
  }, 0);

  return (
    <Box vertical justifyContent="space-around" alignItems="flex-end">
      {transfers.length > 0 && (
        <Text variant="titleMedium" style={[textStyle, totalValue > 0 && styles.positive]}>
          <FiatValue value={Math.abs(totalValue)} />
        </Text>
      )}

      {transfers.map(
        (t) =>
          !t.amount.isZero() && (
            <Text
              key={t.token.addr}
              variant="bodyMedium"
              style={[textStyle, t.direction === TransferType.In && styles.positive]}
            >
              <TokenAmount token={t.token} amount={t.amount} />
            </Text>
          ),
      )}
    </Box>
  );
});

const useStyles = makeStyles(({ colors }) => ({
  positive: {
    color: colors.success,
  },
}));
