import { Addr } from '~/components/addr/Addr';
import { Identicon } from '~/components/Identicon/Identicon';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../../components/card/CardItem';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { InactiveIndicator } from './InactiveIndicator';
import { FiatValue } from '~/components/fiat/FiatValue';
import { useTotalBalanceValue } from '@token/useTotalBalanceValue';

export interface AccountCardProps extends CardItemProps {
  id: Address;
}

export const AccountCard = withSkeleton(
  ({ id, ...cardProps }: AccountCardProps) => {
    const totalFiatValue = useTotalBalanceValue(id);

    return (
      <CardItem
        elevation={2}
        Left={<Identicon seed={id} />}
        Main={
          <Text variant="titleMedium">
            <Addr addr={id} />
          </Text>
        }
        Right={[
          <InactiveIndicator accountAddr={id} />,
          totalFiatValue && (
            <Text variant="bodyLarge">
              <FiatValue value={totalFiatValue} />
            </Text>
          ),
        ]}
        {...cardProps}
      />
    );
  },
  CardItemSkeleton,
);
