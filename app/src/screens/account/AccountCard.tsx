import { Addr } from '~/components/addr/Addr';
import { Identicon } from '~/components/Identicon/Identicon';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../../components/card/CardItem';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { FiatBalance } from '../../components/fiat/FiatBalance';

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
