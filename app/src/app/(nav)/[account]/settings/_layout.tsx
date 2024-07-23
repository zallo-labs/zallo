import { Panes } from '#/layout/Panes';
import { Slot } from 'expo-router';
import _ from 'lodash';
import { AccountSettingsPane } from './index';

export default function AccountSettingsLayout() {
  return (
    <Panes>
      <AccountSettingsPane />
      <Slot />
    </Panes>
  );
}
