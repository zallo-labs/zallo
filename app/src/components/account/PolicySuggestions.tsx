import { Chip } from '#/Chip';
import { showError } from '#/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '@api';
import { PolicyIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { asAddress, asChain } from 'lib';
import _ from 'lodash';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useMutation } from 'urql';
import { asPolicyInput } from '~/lib/policy/draft';
import { ACTION_PRESETS, usePolicyPresets } from '~/lib/policy/usePolicyPresets';

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
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const router = useRouter();
  const create = useMutation(Create)[1];
  const presets = usePolicyPresets({ account, user, chain: asChain(account.address) });

  const potentialApprovers = new Set([
    ...account.approvers.map((a) => a.id),
    ...user.approvers.map((a) => a.id),
  ]);

  const suggestLowRisk = !account.policies.some((p) => p.approvers.length === 1);

  const suggestMediumRisk =
    presets.low.threshold < presets.medium.threshold &&
    presets.medium.threshold < presets.high.threshold &&
    !account.policies.some(
      (p) =>
        p.actions.some((a) => _.isEqual(a.functions, ACTION_PRESETS.all.functions) && !a.allow) &&
        p.actions.some(
          (a) =>
            _.isEqual(
              a.functions,
              ACTION_PRESETS.manageAccount.functions(asAddress(account.address)),
            ) && a.allow,
        ),
    );

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

  const suggestions = [
    suggestLowRisk && presets.low,
    suggestMediumRisk && presets.medium,
    suggestRecovery && presets.recovery,
  ].filter(Boolean);

  const createPolicy = async (preset: (typeof presets)[keyof typeof presets]) => {
    const r = await create({
      input: {
        account: account.address,
        ...asPolicyInput(preset),
      },
    });
    if (r.error)
      return showError('Something went wrong creating policy', { event: { error: r.error } });
    if (!r.data) return showError('Something went wrong creating policy');

    const p = r.data.createPolicy;
    if (p?.__typename === 'NameTaken')
      return showError(`A policy with the name "${preset.name}" already exists`);

    router.push({
      pathname: '/(drawer)/[account]/settings/policy/[id]/',
      params: { account: account.address, id: p.id },
    });
  };

  if (!suggestions.length) return null;

  return (
    <>
      <Text variant="labelLarge">New policy suggestions</Text>

      <View style={styles.container}>
        {suggestions.map((s) => (
          <Chip key={s.name} mode="outlined" style={styles.chip} onPress={() => createPolicy(s)}>
            {s.name}
          </Chip>
        ))}
      </View>
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  label: {
    color: colors.onSurfaceVariant,
  },
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: 'transparent',
  },
}));
