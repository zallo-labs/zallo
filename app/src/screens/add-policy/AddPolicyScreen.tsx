import { AddIcon } from '@theme/icons';
import { Address } from 'lib';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface AddPolicyScreenParams {
  account: Address;
}

export type AddPolicyScreenProps = StackNavigatorScreenProps<'AddPolicy'>;

export const AddPolicyScreen = withSuspense(
  ({ navigation: { replace }, route }: AddPolicyScreenProps) => {
    const { account } = route.params;

    return (
      <Screen>
        <Appbar mode="large" leading="back" headline="Add policy" />

        <ListHeader>Policy for transactions that are</ListHeader>

        <ListItem
          headline="Low risk"
          supporting="One approval recommended"
          trailing={AddIcon}
          onPress={() => replace('Policy', { account, template: 'low' })}
        />

        <ListItem
          headline="Medium risk"
          supporting="A few approvals recommended"
          trailing={AddIcon}
          onPress={() => replace('Policy', { account, template: 'medium' })}
        />

        <ListItem
          headline="High risk"
          supporting="Several approvals recommended"
          trailing={AddIcon}
          onPress={() => replace('Policy', { account, template: 'high' })}
        />
      </Screen>
    );
  },
  ScreenSkeleton,
);
