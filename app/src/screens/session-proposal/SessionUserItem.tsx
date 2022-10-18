import { UserId } from 'lib';
import { Checkbox, Text } from 'react-native-paper';
import { Identicon } from '~/components/Identicon/Identicon';
import { Item, ItemProps } from '~/components/item/Item';
import { ItemSkeleton } from '~/components/item/ItemSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/user/useUser.api';

export interface SessionUserItemProps extends ItemProps {
  user: UserId;
}

const SessionUserItem = ({
  user: userId,
  selected,
  onPress,
  ...itemProps
}: SessionUserItemProps) => {
  const [user] = useUser(userId);
  const [account] = useAccount(userId);

  return (
    <Item
      Left={<Identicon seed={account.addr} />}
      Main={[
        <Text variant="titleLarge">{account.name}</Text>,
        <Text variant="bodyMedium">{user.name}</Text>,
      ]}
      Right={
        <Checkbox
          status={selected ? 'checked' : 'unchecked'}
          onPress={onPress}
        />
      }
      padding="vertical"
      {...itemProps}
    />
  );
};

export default withSkeleton(SessionUserItem, ItemSkeleton);
