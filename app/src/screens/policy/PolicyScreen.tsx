import { PolicyGuid } from 'lib';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface PolicyScreenParams {
  policy: PolicyGuid;
}

export type PolicyScreenProps = StackNavigatorScreenProps<'Policy'>;

export const PolicyScreen = withSkeleton((props: PolicyScreenProps) => {
  return null;
}, ScreenSkeleton);
