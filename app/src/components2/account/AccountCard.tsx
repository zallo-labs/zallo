import { Addr } from '@components/Addr';
import { Identicon } from '@components/Identicon';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { FiatBalance } from '../fiat/FiatBalance';

export interface AccountCardProps extends CardItemProps {
  id: Address;
}

export const AccountCard = withSkeleton(
  ({ id, ...cardProps }: AccountCardProps) => (
    <CardItem
      elevation={2}
      Left={<Identicon seed={id} />}
      Main={
        <Text variant="titleMedium">
          <Addr addr={id} />
        </Text>
      }
      Right={
        <Text variant="bodyLarge">
          <FiatBalance addr={id} />
        </Text>
      }
      {...cardProps}
    />
  ),
  CardItemSkeleton,
);
