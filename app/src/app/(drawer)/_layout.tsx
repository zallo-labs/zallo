import { Drawer } from '~/components/drawer/Drawer';

export const unstable_settings = {
  initialRouteName: `[account]/(home)`,
};

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name={`[account]/(home)`} />
      <Drawer.Screen name={`[account]/policies/[key]/[contract]/index`} />
      <Drawer.Screen name={`[account]/policies/[key]/approvers`} />
      <Drawer.Screen name={`[account]/policies/[key]/index`} />
      <Drawer.Screen name={`[account]/policies/index`} />
      <Drawer.Screen name={`[account]/swap`} />
      <Drawer.Screen name={`[account]/tokens`} options={{ headerShown: false }} />
      <Drawer.Screen name={`[account]/transfer`} />
      <Drawer.Screen name={`approver/[address]/index`} />
      <Drawer.Screen name={`contacts/[address]`} />
      <Drawer.Screen name={`contacts/add`} />
      <Drawer.Screen name={`contacts/index`} options={{ headerShown: false }} />
      <Drawer.Screen name={`ledger/link`} />
      <Drawer.Screen name={`message/[hash]`} />
      <Drawer.Screen name={`sessions/index`} />
      <Drawer.Screen name={`settings/auth`} />
      <Drawer.Screen name={`settings/notifications`} />
      <Drawer.Screen name={`token/[token]`} />
      <Drawer.Screen name={`token/add`} />
      <Drawer.Screen name={`transaction/[hash]`} />
      <Drawer.Screen name={`user`} />
    </Drawer>
  );
}
