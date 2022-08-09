import { Subheading } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { HomeScreenProps } from '@features/home/HomeScreen';
import { GroupName } from '@components/GroupName';
import { CombinedWallet } from '~/queries/wallets';

export interface GroupItemProps extends ItemProps {
  group: CombinedWallet;
}

export const GroupItem = ({ group, ...liProps }: GroupItemProps) => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  return (
    <Item
      Left={<Identicon seed={group.ref} />}
      Main={
        <Subheading>
          <GroupName group={group} />
        </Subheading>
      }
      onPress={() =>
        navigation.navigate('GroupManagement', { groupId: group.id })
      }
      {...liProps}
    />
  );
};
