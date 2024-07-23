import { Panes } from '#/layout/Panes';
import { Slot } from 'expo-router';
import { HomePane } from './index';

export default function HomeLayout() {
  return (
    <Panes>
      <HomePane />
      <Slot />
    </Panes>
  );
}

export { ErrorBoundary } from '#/ErrorBoundary';
