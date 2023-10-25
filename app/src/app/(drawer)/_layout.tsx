import { Drawer } from '~/components/drawer/Drawer';
import { RootDrawer } from '~/components/drawer/RootDrawer';

export const unstable_settings = {
  initialRouteName: `[account]/(home)`,
};

export default function DrawerLayout() {
  return <Drawer drawerContent={RootDrawer} />;
}
