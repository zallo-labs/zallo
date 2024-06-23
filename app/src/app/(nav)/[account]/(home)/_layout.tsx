import { Panes } from '#/layout/Panes';
import { Slot, Stack } from 'expo-router';
import { HomePane } from './index';

export default function HomeLayout() {
  return (
    <Panes>
      <Stack.Screen options={{ headerShown: false }} />
      <HomePane />
      <Slot />
    </Panes>
  );
}

export { ErrorBoundary } from '#/ErrorBoundary';
