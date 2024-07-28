import { Chip } from '#/Chip';
import { showError } from '#/provider/SnackbarProvider';
import { createStyles, useStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { asChain } from 'lib';
import _ from 'lodash';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { PolicySuggestionsMutation } from '~/api/__generated__/PolicySuggestionsMutation.graphql';
import { PolicySuggestions_account$key } from '~/api/__generated__/PolicySuggestions_account.graphql';
import { PolicySuggestions_user$key } from '~/api/__generated__/PolicySuggestions_user.graphql';
import { asPolicyInput } from '~/lib/policy/policyAsDraft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';

const Create = graphql`
  mutation PolicySuggestionsMutation($input: ProposePoliciesInput!) {
    proposePolicies(input: $input) {
      __typename
      ... on Policy {
        id
        draft {
          id
        }
      }
    }
  }
`;

const Account = graphql`
  fragment PolicySuggestions_account on Account {
    id
    address
    policies {
      id
      key
    }
    ...usePolicyPresets_account
  }
`;

const User = graphql`
  fragment PolicySuggestions_user on User {
    id
    ...usePolicyPresets_user
  }
`;

export interface PolicySuggestionsProps {
  account: PolicySuggestions_account$key;
  user: PolicySuggestions_user$key;
}

export function PolicySuggestions(props: PolicySuggestionsProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const router = useRouter();
  const proposePolicies = useMutation<PolicySuggestionsMutation>(Create);
  const presets = usePolicyPresets({ account, user, chain: asChain(account.address) });

  const policyKeys = new Set(account.policies.map((p) => p.key));
  const suggestions = Object.values(presets)
    .map((p) => !policyKeys.has(p.key) && p)
    .filter(Boolean);

  const createPolicy = async (preset: (typeof presets)[keyof typeof presets]) => {
    const r = (
      await proposePolicies({
        input: {
          account: account.address,
          policies: [asPolicyInput(preset)],
        },
      })
    ).proposePolicies?.[0];

    router.push({
      pathname: '/(nav)/[account]/settings/policy/[id]/',
      params: { account: account.address, id: r.id },
    });
  };

  if (!suggestions.length) return null;

  return (
    <>
      <Text variant="labelLarge">New policy suggestions</Text>

      <FlatList
        horizontal
        data={suggestions}
        renderItem={({ item: s }) => (
          <Chip mode="outlined" style={styles.chip} onPress={() => createPolicy(s)}>
            {s.name}
          </Chip>
        )}
        keyExtractor={(s) => s.name}
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}
      />
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
