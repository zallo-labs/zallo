import { Chip } from '#/Chip';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListHeader } from '#/list/ListHeader';
import { showError } from '#/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '@api';
import { GroupIcon, RecoveryIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { asAddress, asChain } from 'lib';
import { View } from 'react-native';
import { useMutation } from 'urql';
import { asPolicyInput } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { truncateAddr } from '~/util/format';

const Create = gql(/* GraphQL */ `
  mutation PolicySuggestions_Create($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      __typename
      ... on Policy {
        id
        draft {
          id
        }
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation PolicySuggestions_Update($input: UpdatePolicyInput!) {
    updatePolicy(input: $input) {
      __typename
      ... on Policy {
        id
        draft {
          id
        }
      }
    }
  }
`);

const Account = gql(/* GraphQL */ `
  fragment PolicySuggestions_Account on Account {
    id
    address
    policies {
      id
      key
      name
      approvers {
        id
        address
      }
      delay
      actions {
        id
        functions {
          id
          contract
          selector
        }
        allow
      }
    }
    approvers {
      id
    }
    ...UsePolicyPresets_Account
  }
`);

const User = gql(/* GraphQL */ `
  fragment PolicySuggestions_User on User {
    id
    approvers {
      id
      address
      label
    }
    ...UsePolicyPresets_User
  }
`);

export interface PolicySuggestionsProps {
  account: FragmentType<typeof Account>;
  user: FragmentType<typeof User>;
}

export function PolicySuggestions(props: PolicySuggestionsProps) {
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const router = useRouter();
  const create = useMutation(Create)[1];
  const update = useMutation(Update)[1];
  const presets = usePolicyPresets({ account, user, chain: asChain(account.address) });

  const groupPoliciesMissingApprovers = account.policies.filter(
    (p) =>
      p.approvers.length > 1 &&
      !user.approvers.every(({ id }) => p.approvers.find((a) => a.id === id)),
  );

  const approverPolicies = user.approvers.filter(
    ({ id }) => !account.policies.find((p) => p.approvers.length === 1 && p.approvers[0].id === id),
  );

  const potentialApprovers = new Set([
    ...account.approvers.map((a) => a.id),
    ...user.approvers.map((a) => a.id),
  ]);
  const suggestRecovery =
    potentialApprovers.size > 1 &&
    !account.policies.some(
      (p) =>
        // Account management allowed with a delay
        p.delay &&
        p.actions.some(
          (a) =>
            a.allow &&
            a.functions.some(
              (f) => (!f.contract || f.contract === asAddress(account.address)) && !f.selector,
            ),
        ),
    );

  const hasSuggestions =
    groupPoliciesMissingApprovers.length || approverPolicies.length || suggestRecovery;
  if (!hasSuggestions) return null;

  const addMissingApprovers = async (p: (typeof groupPoliciesMissingApprovers)[0]) => {
    const r = (
      await update({
        input: {
          account: account.address,
          key: p.key,
          approvers: [
            ...new Set([
              ...p.approvers.map((a) => a.address),
              ...user.approvers.map((a) => a.address),
            ]),
          ],
        },
      })
    ).data?.updatePolicy;

    if (r?.__typename === 'Policy' && r.draft?.id) {
      router.push({
        pathname: '/(drawer)/[account]/settings/policy/[id]/',
        params: { account: account.address, id: r.draft.id },
      });
    } else {
      showError('Something went wrong adding approvers to policy', {
        event: { policy: p.id },
      });
    }
  };

  const addApproverPolicy = async (approver: (typeof approverPolicies)[0]) => {
    const r = (
      await create({
        input: {
          account: account.address,
          ...asPolicyInput(presets.low),
          approvers: [approver.address],
        },
      })
    ).data?.createPolicy;

    if (r?.__typename === 'Policy') {
      router.push({
        pathname: '/(drawer)/[account]/settings/policy/[id]/',
        params: { account: account.address, id: r.id },
      });
    } else {
      showError('Something went wrong creating policy', {
        event: { approver: approver.id },
      });
    }
  };

  const addRecoveryPolicy = async () => {
    const r = (
      await create({ input: { account: account.address, ...asPolicyInput(presets.recovery) } })
    ).data?.createPolicy;

    if (r?.__typename === 'Policy') {
      router.push({
        pathname: '/(drawer)/[account]/settings/policy/[id]/',
        params: { account: account.address, id: r.id },
      });
    } else {
      showError('Something went wrong creating recovery policy');
    }
  };

  return (
    <>
      <ListHeader>Suggestions</ListHeader>

      <View style={styles.container}>
        {suggestRecovery && (
          <Chip mode="outlined" icon={RecoveryIcon} onPress={addRecoveryPolicy}>
            Recovery policy
          </Chip>
        )}

        {groupPoliciesMissingApprovers.map((p) => (
          <Chip
            key={p.id}
            mode="outlined"
            icon={GroupIcon}
            onPress={() => addMissingApprovers(p)}
          >{`Add approvers to ${p.name}`}</Chip>
        ))}

        {approverPolicies.map((approver) => (
          <Chip
            key={approver.id}
            mode="outlined"
            icon={(props) => <AddressIcon address={approver.address} {...props} />}
            onPress={() => addApproverPolicy(approver)}
          >{`Low risk for ${approver.label || truncateAddr(approver.address)}`}</Chip>
        ))}
      </View>
    </>
  );
}

const styles = createStyles({
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
