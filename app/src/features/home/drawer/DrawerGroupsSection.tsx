import { effectiveGroupName } from '@components/FormattedGroupName';
import { Identicon } from '@components/Identicon';
import { useSafe } from '@features/safe/SafeProvider';
import { useNavigation } from '@react-navigation/native';
import { Drawer } from 'react-native-paper';
import { HomeScreenProps } from '../HomeScreen';

export const DrawerGroupsSection = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { groups } = useSafe();

  return (
    <Drawer.Section title="Groups">
      {groups.map((g) => (
        <Drawer.Item
          key={g.id}
          label={effectiveGroupName(g)}
          icon={(props) => <Identicon size={props.size} seed={g.ref} />}
          onPress={() =>
            navigation.navigate('GroupManagement', { groupId: g.id })
          }
        />
      ))}

      <Drawer.Item
        label="Add"
        icon="account-multiple-plus"
        onPress={() => navigation.navigate('GroupManagement')}
      />
    </Drawer.Section>
  );
};
