import { FirstPane } from '#/layout/FirstPane';
import { Panes } from '#/layout/Panes';
import { Slot, Stack } from 'expo-router';
import { ContactsPane } from './index';

export default function ContactsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Panes>
        <FirstPane fixed>
          <ContactsPane />
        </FirstPane>

        <Slot />
      </Panes>
    </>
  );
}
