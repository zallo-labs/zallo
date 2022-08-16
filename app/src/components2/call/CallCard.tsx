import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { TokenIcon } from '@components/token/TokenIcon';
import { makeStyles } from '@util/theme/makeStyles';
import { Text } from 'react-native-paper';
import { Tx, TxId } from '~/queries/tx';
import { useTx } from '~/queries/tx/useTx';
import { ETH } from '~/token/tokens';
import { useMaybeToken } from '~/token/useToken';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { CallMethod } from './CallMethod';
import { CallValues } from './CallValues';
import { DetailedCallMethod } from './DetailedCallMethod';

export type CallCardVariant = 'compact' | 'full';

interface StyleProps {
  tx?: Tx;
  variant: CallCardVariant;
}

export interface CallCardProps extends CardProps {
  id: TxId;
  variant?: CallCardVariant;
}

export const CallCard = withSkeleton(
  ({ id, variant = 'compact', ...cardProps }: CallCardProps) => {
    const { tx } = useTx(id);
    const token = useMaybeToken(tx?.to) ?? ETH;
    const styles = useStyles({ tx, variant });

    if (!tx) return <Suspend />;

    return (
      <Card {...cardProps} style={[styles.card, cardProps.style]}>
        <Box horizontal>
          <Box flex={1} horizontal alignItems="center">
            <TokenIcon token={token} />

            <Box flex={1} vertical ml={3}>
              <Text variant="titleMedium" style={styles.text}>
                <Addr addr={tx.to} />
              </Text>

              {variant === 'compact' && (
                <Text variant="bodyMedium" style={styles.text}>
                  <CallMethod call={tx} />
                </Text>
              )}
            </Box>
          </Box>

          <CallValues call={tx} token={token} textStyle={styles.text} />
        </Box>

        {variant === 'full' && (
          <Box mt={3}>
            <DetailedCallMethod call={tx} />
          </Box>
        )}
      </Card>
    );
  },
  CardItemSkeleton,
);

const useStyles = makeStyles(
  ({ colors, onBackground }, { tx, variant }: StyleProps) => {
    let backgroundColor: string | undefined = undefined;
    if (variant === 'compact' && tx) {
      backgroundColor =
        !tx.userHasApproved && !tx.submissions.length
          ? colors.primaryContainer
          : colors.secondaryContainer;
    }

    return {
      card: {
        ...(backgroundColor && { backgroundColor }),
      },
      text: {
        color: onBackground(backgroundColor),
      },
    };
  },
);
