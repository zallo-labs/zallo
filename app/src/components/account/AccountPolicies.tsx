import { ListHeader } from '#/list/ListHeader';
import { PolicyItem } from '#/policy/PolicyItem';
import { FragmentType, gql, useFragment } from '@api';
import { NavigateNextIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

const Account = gql(/* GraphQL */ `
  fragment AccountPolicies_Account on Account {
    id
    address
    policies {
      id
      key
      active
      threshold
      approvers {
        id
      }
      draft {
        id
      }
      ...PolicyItem_Policy
    }
  }
`);

export interface AccountPoliciesProps {
  account: FragmentType<typeof Account>;
}

export function AccountPolicies(props: AccountPoliciesProps) {
  const account = useFragment(Account, props.account);
  const router = useRouter();

  const policies = account.policies.sort(
    (a, b) => a.threshold - b.threshold || a.approvers.length - b.approvers.length || a.key - b.key,
  );

  return (
    <>
      <ListHeader>Policies</ListHeader>

      {policies.map((policy) => (
        <PolicyItem
          key={policy.key}
          policy={policy}
          trailing={({ Text, ...props }) => (
            <View style={styles.trailingContainer}>
              <Text>
                {[policy.active && 'Active', policy.draft && 'Draft'].filter(Boolean).join(' | ')}
              </Text>
              <NavigateNextIcon {...props} />
            </View>
          )}
          onPress={() => {
            router.push({
              pathname: `/(drawer)/[account]/policies/[id]/`,
              params: { account: account.address, id: policy.id },
            });
          }}
        />
      ))}
    </>
  );
}

const styles = createStyles({
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
