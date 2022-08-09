import { effectiveGroupName } from '@components/GroupName';
import { Identicon } from '@components/Identicon';
import { useAccount } from '@features/account/AccountProvider';
import { Drawer } from 'react-native-paper';
import { useDrawerNavigation } from './DrawerNavigationProvider';

export const DrawerGroupsSection = () => {
  const navigate = useDrawerNavigation();
  const { groups } = useAccount();

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
        icon="wallet-multiple-plus"
        onPress={() => navigate('GroupManagement', {})}
      />
    </Drawer.Section>
  );
};
