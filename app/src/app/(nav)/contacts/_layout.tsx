import { Panes } from '#/layout/Panes';
import { Slot } from 'expo-router';
import { ContactsPane } from './index';
import { Pane } from '#/layout/Pane';

export default function ContactsLayout() {
  return (
    <Panes>
      <Pane fixed>
        <ContactsPane />
      </Pane>

      <Slot />
    </Panes>
  );
}
