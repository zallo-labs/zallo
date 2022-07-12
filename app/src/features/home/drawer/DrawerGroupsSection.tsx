import { effectiveGroupName } from '@components/FormattedGroupName';
import { Identicon } from '@components/Identicon';
import { useSafe } from '@features/safe/SafeProvider';
import { Drawer } from 'react-native-paper';
import { useDrawerNavigation } from './DrawerNavigationProvider';

export const DrawerGroupsSection = () => {
  const navigate = useDrawerNavigation();
  const { groups } = useSafe();

  return (
    <Drawer.Section title="Groups">
      {groups.map((g) => (
        <Drawer.Item
          key={g.id}
          label={effectiveGroupName(g)}
          icon={(props) => <Identicon size={props.size} seed={g.ref} />}
          onPress={() => navigate('GroupManagement', { groupId: g.id })}
        />
      ))}

      <Drawer.Item
        label="Add"
        icon="account-multiple-plus"
        onPress={() => navigate('GroupManagement')}
      />
    </Drawer.Section>
  );
};
