import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { TokenIcon } from '@components/token/TokenIcon';
import { makeStyles } from '@util/theme/makeStyles';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { isProposedTx, Tx, TxId } from '~/queries/tx';
import { useTx } from '~/queries/tx/useTx';
import { ETH } from '~/token/tokens';
import { useMaybeToken } from '~/token/useToken';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { CallMethod } from './CallMethod';
import { CallValues } from './CallValues';

export interface CallCardProps extends CardProps {
  id: TxId;
}

export const CallCard = withSkeleton(({ id, ...cardProps }: CallCardProps) => {
  const { tx, loading } = useTx(id);
  const token = useMaybeToken(tx?.to) ?? ETH;
  const styles = useStyles(tx);

  if (!tx || loading) return <Suspend />;

  return (
    <Card horizontal {...cardProps} style={[styles.card, cardProps.style]}>
      <Box flex={1} horizontal alignItems="center">
        <TokenIcon token={token} />

        <Box flex={1} vertical justifyContent="space-around" ml={3}>
          <Text variant="titleMedium" style={styles.text}>
            <Addr addr={tx.to} />
          </Text>

          <Text variant="bodyMedium" style={styles.text}>
            <CallMethod call={tx} />
          </Text>
        </Box>
      </Box>

      <CallValues call={tx} token={token} textStyle={styles.text} />
    </Card>
  );
}, CardItemSkeleton);

const useStyles = makeStyles(({ colors, onBackground }, tx?: Tx) => {
  const backgroundColor: string | undefined = useMemo(() => {
    if (!tx) return undefined;

    if (isProposedTx(tx)) {
      return !tx.userHasApproved && !tx.submissions.length
        ? colors.primaryContainer
        : colors.secondaryContainer;
    }

    return undefined;
  }, [tx, colors]);

  return {
    card: {
      ...(backgroundColor && { backgroundColor }),
    },
    text: {
      color: onBackground(backgroundColor),
    },
  };
});
