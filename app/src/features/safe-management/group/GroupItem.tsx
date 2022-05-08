import { Pressable } from 'react-native';
import { Subheading, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { GroupName } from '@components/GroupName';
import { Identicon, IDENTICON_SIZE } from '@components/Identicon';
import { ListItem } from '@components/ListItem';
import { MaterialIcons } from '@expo/vector-icons';
import { HomeScreenProps } from '@features/home/HomeScreen';
import { Group } from '@queries';

export interface GroupItemProps {
  group: Group;
}

export const GroupItem = ({ group }: GroupItemProps) => {
  const { colors } = useTheme();
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  return (
    <Pressable
      onPress={() => navigation.push('GroupManagement', { groupId: group.id })}
    >
      <ListItem
        Left={<Identicon seed={group.hash} />}
        Main={
          <Subheading>
            <GroupName group={group} />
          </Subheading>
        }
        Right={
          <MaterialIcons
            name="chevron-right"
            size={IDENTICON_SIZE}
            color={colors.onSurface}
          />
        }
      />
    </Pressable>
  );
};
