import { Slot } from 'expo-router';
import { ActivityPane } from './index';

export default function ActivityLayout() {
  return (
    <>
      <ActivityPane />
      <Slot />
    </>
  );
}
