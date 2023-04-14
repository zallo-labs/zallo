import { StyleSheet } from 'react-native';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TabNavigatorScreenProp } from '.';

export type CollectablesTabProps = TabNavigatorScreenProp<'Collectables'>;

export const CollectablesTab = withSuspense(() => null, TabScreenSkeleton);

const styles = StyleSheet.create({});
