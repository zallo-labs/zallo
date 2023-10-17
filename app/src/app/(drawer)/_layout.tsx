import { Stack } from 'expo-router';
import { Drawer } from '~/components/drawer/Drawer';

export const unstable_settings = {
  initialRouteName: `[account]/(home)`,
};

export default function DrawerLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Drawer />
    </>
  );
}
