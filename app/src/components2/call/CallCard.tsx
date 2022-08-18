import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { TokenIcon } from '@components/token/TokenIcon';
import { makeStyles } from '@util/theme/makeStyles';
import { assertUnreachable } from 'lib';
import { Text } from 'react-native-paper';
import { Tx, TxId } from '~/queries/tx';
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
  const { tx } = useTx(id);
  const token = useMaybeToken(tx?.to) ?? ETH;
  const styles = useStyles(tx);

  if (!tx) return <Suspend />;

  return (
    <Card {...cardProps} elevation={4} style={[styles.card, cardProps.style]}>
      <Box horizontal>
        <Box flex={1} horizontal alignItems="center">
          <TokenIcon token={token} />

          <Box flex={1} vertical ml={3}>
            <Text variant="titleMedium" style={styles.text}>
              <Addr addr={tx.to} />
            </Text>

            <Text variant="bodyMedium" style={styles.text}>
              <CallMethod call={tx} />
            </Text>
          </Box>
        </Box>

        <CallValues call={tx} token={token} textStyle={styles.text} />
      </Box>
    </Card>
  );
}, CardItemSkeleton);

const useStyles = makeStyles(({ colors, onBackground }, tx: Tx) => {
  const backgroundColor = ((): string | undefined => {
    switch (tx?.status) {
      case 'proposed':
        return !tx.userHasApproved
          ? colors.primaryContainer
          : colors.secondaryContainer;
      case 'submitted':
        return colors.secondaryContainer;
      case 'failed':
        return colors.errorContainer;
      case 'executed':
      case undefined:
        return undefined;
      default:
        assertUnreachable(tx);
    }
  })();

  return {
    card: {
      ...(backgroundColor && { backgroundColor }),
    },
    text: {
      color: onBackground(backgroundColor),
    },
  };
});
