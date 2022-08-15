import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { FiatBalance } from '../fiat/FiatBalance';

export interface AccountCardProps extends CardProps {
  id: Address;
}

export const AccountCard = withSkeleton(
  ({ id, ...cardProps }: AccountCardProps) => {
    return (
      <Card {...cardProps}>
        <Text variant="titleMedium">
          <Addr addr={id} />
        </Text>

        <Box flexGrow={1} horizontal justifyContent="flex-end">
          <Text variant="bodyLarge">
            <FiatBalance addr={id} />
          </Text>
        </Box>
      </Card>
    );
  },
  CardItemSkeleton,
);
