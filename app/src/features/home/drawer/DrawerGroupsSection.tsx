import { useSafe } from '@features/safe/SafeProvider';
import { elipseTruncate } from '@util/format';
import { Drawer } from 'react-native-paper';

export interface DrawerGroupsSectionProps {}

export const DrawerGroupsSection = (props: DrawerGroupsSectionProps) => {
  const { groups } = useSafe();

  return (
    <Drawer.Section title="Groups">
      {groups.map((g) => (
        <Drawer.Item key={g.id} label={g.name || elipseTruncate(g.ref, 6, 4)} />
      ))}
    </Drawer.Section>
  );
};
