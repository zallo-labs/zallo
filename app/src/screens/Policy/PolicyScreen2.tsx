import { AccountId, useAccount } from '@api/account';
import { usePolicy } from '@api/policy';
import { asPolicyKey } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';

export interface PolicyScreenParams {
  account: AccountId;
  key?: string;
}

export type PolicyScreenProps = StackNavigatorScreenProps<'Policy'>;

export const PolicyScreen = ({ route, navigation }: PolicyScreenProps) => {
  const account = useAccount(route.params.account);
  const policy = usePolicy(
    route.params.key ? { account: account.id, key: asPolicyKey(route.params.key) } : undefined,
  );

  return null;
};
