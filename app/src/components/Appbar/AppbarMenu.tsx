import { materialCommunityIcon } from '@theme/icons';
import { useDrawerActions, useDrawerContext } from '~/components/drawer/DrawerContextProvider';

const MenuIcon = materialCommunityIcon('menu');

export function AppbarMenu() {
  const { type } = useDrawerContext();
  const { toggle } = useDrawerActions();

  if (type === 'standard') return null;

  return <MenuIcon onPress={toggle} />;
}
