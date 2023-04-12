import { PolicyId } from 'lib';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface PolicyScreenParams {
  policy: PolicyId;
}

export type PolicyScreenProps = StackNavigatorScreenProps<'Policy'>;

export const PolicyScreen = withSuspense((props: PolicyScreenProps) => {
  return null;
}, ScreenSkeleton);
