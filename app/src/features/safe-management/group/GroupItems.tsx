import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Subheading, useTheme } from 'react-native-paper';
import { IDENTICON_SIZE } from '@components/Identicon';
import { ItemsContainer } from '@components/ItemsContainer';
import { ListItem } from '@components/ListItem';
import { useSafe } from '@features/safe/SafeProvider';
import { GroupItem } from './GroupItem';

export const GroupItems = () => {
  const { colors } = useTheme();
  const { groups } = useSafe();

  return (
    <ItemsContainer>
      {groups.map((group) => (
        <GroupItem key={group.id} group={group} />
      ))}

      <ListItem
        Left={
          <MaterialCommunityIcons
            name="plus"
            size={IDENTICON_SIZE}
            color={colors.onSurface}
          />
        }
        Main={<Subheading>Add</Subheading>}
      />
    </ItemsContainer>
  );
};
