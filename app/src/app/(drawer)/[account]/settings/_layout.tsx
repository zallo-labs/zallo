import { Panes } from '#/layout/Panes';
import { Slot, Stack } from 'expo-router';
import _ from 'lodash';
import { AccountSettingsPane } from './index';

export default function AccountSettingsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Panes>
        <AccountSettingsPane />
        <Slot />
      </Panes>
    </>
  );
}
