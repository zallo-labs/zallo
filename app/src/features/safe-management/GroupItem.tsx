import { Subheading } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { GroupName } from '@components/GroupName';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { HomeScreenProps } from '@features/home/HomeScreen';
import { CombinedGroup } from '@queries';

export interface GroupItemProps extends ItemProps {
  group: CombinedGroup;
}

export const GroupItem = ({ group, ...liProps }: GroupItemProps) => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  return (
    <Item
      Left={<Identicon seed={group.hash} />}
      Main={
        <Subheading>
          <GroupName group={group} />
        </Subheading>
      }
      onPress={() => navigation.push('GroupManagement', { groupId: group.id })}
      {...liProps}
    />
  );
};
