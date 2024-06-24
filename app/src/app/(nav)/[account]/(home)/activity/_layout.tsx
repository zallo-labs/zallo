import { Panes } from '#/layout/Panes';
import { Slot } from 'expo-router';
import { ActivityPane } from './index';

export default function ActivityLayout() {
  return (
    <Panes>
      <ActivityPane />
      <Slot />
    </Panes>
  );
}
