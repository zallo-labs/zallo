import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { CardItem, CardItemProps } from '../../components/card/CardItem';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { FiatValue } from '../../components/fiat/FiatValue';
import { useTotalBalanceValue } from '@token/useTotalBalanceValue';
import { UserId } from 'lib';
import { useUser } from '~/queries/user/useUser.api';

export interface UserItemCardProps extends CardItemProps {
  id: UserId;
  showAccount?: boolean;
}

export const UserItemCard = withSkeleton(
  ({ id, showAccount = true, ...props }: UserItemCardProps) => {
    const [user] = useUser(id);
    const totalFiatValue = useTotalBalanceValue(user.account);

    return (
      <CardItem
        Main={[
          <Text variant="titleMedium">{user.name}</Text>,
          showAccount && (
            <Text variant="bodySmall">
              <Addr addr={user.account} />
            </Text>
          ),
        ]}
        Right={[
          // <ProposableStatusIcon state={user.state} />,
          totalFiatValue && (
            <Text variant="bodyLarge">
              <FiatValue value={totalFiatValue} /> available
            </Text>
          ),
        ]}
        {...props}
      />
    );
  },
  CardItemSkeleton,
);
