import { materialCommunityIcon } from '@theme/icons';
import { useDrawerContext } from '~/components/drawer/DrawerContextProvider';

const MenuIcon = materialCommunityIcon('menu');

export function AppbarMenu() {
  const { toggle, type } = useDrawerContext();

  if (type === 'standard') return null;

  return <MenuIcon onPress={toggle} />;
}
