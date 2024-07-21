import { Panes } from '#/layout/Panes';
import { Slot, Stack } from 'expo-router';
import { ContactsPane } from './index';
import { Pane } from '#/layout/Pane';

export default function ContactsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Panes>
        <Pane fixed>
          <ContactsPane />
        </Pane>

        <Slot />
      </Panes>
    </>
  );
}
