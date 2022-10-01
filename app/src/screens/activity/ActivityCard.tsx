import { makeStyles } from '~/util/theme/makeStyles';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '../../components/card/Card';
import { Box } from '~/components/layout/Box';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { Addr } from '../../components/addr/Addr';
import { Token } from '@token/token';
import { Address } from 'lib';
import { ActivityTransfers } from './ActivityTransfers';
import { Transfer } from '~/queries/transfer/useTransfer.sub';

export interface ActivityCardProps extends CardProps {
  token: Token;
  addr: Address;
  label?: string;
  transfers: Transfer[];
  backgroundColor?: string;
}

export const ActivityCard = ({
  token,
  addr,
  label,
  transfers,
  backgroundColor,
  style,
  ...cardProps
}: ActivityCardProps) => {
  const styles = useStyles(backgroundColor);

  return (
    <Card {...cardProps} style={[style, styles.card]}>
      <Box horizontal>
        <Box flex={1} horizontal alignItems="center">
          <TokenIcon token={token} />

          <Box flex={1} vertical ml={3}>
            <Text variant="titleMedium" style={styles.text}>
              <Addr addr={addr} />
            </Text>

            {label && (
              <Text variant="bodyMedium" style={styles.text}>
                {label}
              </Text>
            )}
          </Box>
        </Box>

        <ActivityTransfers transfers={transfers} />
      </Box>
    </Card>
  );
};

const useStyles = makeStyles(({ onBackground }, backgroundColor?: string) => ({
  card: {
    ...(backgroundColor && { backgroundColor }),
  },
  text: {
    color: onBackground(backgroundColor),
  },
}));
