import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import _ from 'lodash';
import { PolicyAppbar } from '#/policy/PolicyAppbar';
import { usePolicyDraftAtom, asPolicyInput, PolicyDraft } from '~/lib/policy/policyAsDraft';
import { showError } from '#/provider/SnackbarProvider';
import { ApprovalSettings } from '#/policy/ApprovalSettings';
import { SpendingSettings } from '#/policy/SpendingSettings';
import { ActionsSettings } from '#/policy/ActionsSettings';
import { PolicyPresets } from '#/policy/PolicyPresets';
import { createStyles } from '@theme/styles';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { PolicySideSheet } from '#/policy/PolicySideSheet';
import { SignMessageSettings } from '#/policy/SignMessageSettings';
import { DelaySettings } from '#/policy/DelaySettings';
import { useMemo } from 'react';
import { Pane } from '#/layout/Pane';
import { ScrollView } from 'react-native';
import { AddIcon, UpdateIcon } from '@theme/icons';
import { Fab } from '#/Fab';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { PolicyPane_account$key } from '~/api/__generated__/PolicyPane_account.graphql';
import { PolicyPane_policy$key } from '~/api/__generated__/PolicyPane_policy.graphql';
import { PolicyPane_user$key } from '~/api/__generated__/PolicyPane_user.graphql';
import { useMutation } from '~/api';
import { PolicyPane_createMutation } from '~/api/__generated__/PolicyPane_createMutation.graphql';
import { PolicyPane_updateMutation } from '~/api/__generated__/PolicyPane_updateMutation.graphql';

const Create = graphql`
  mutation PolicyPane_createMutation($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      __typename
      ... on Policy {
        id
        proposal {
          id
        }
        draft {
          id
          proposal {
            id
          }
        }
      }
      ... on Err {
        message
      }
    }
  }
`;

const Update = graphql`
  mutation PolicyPane_updateMutation($input: UpdatePolicyInput!) {
    updatePolicy(input: $input) {
      __typename
      ... on Policy {
        id
        proposal {
          id
        }
        draft {
          id
          proposal {
            id
          }
        }
      }
      ... on Err {
        message
      }
    }
  }
`;

const Account = graphql`
  fragment PolicyPane_account on Account {
    id
    address
    ...PolicyPresets_account
    ...PolicySideSheet_account
  }
`;

const Policy = graphql`
  fragment PolicyPane_policy on Policy {
    id
    draft {
      id
    }
    proposal {
      id
    }
    ...PolicyAppbar_policy
    ...PolicySideSheet_policy
  }
`;

const User = graphql`
  fragment PolicyPane_user on User {
    id
    ...PolicyPresets_user
  }
`;

export interface PolicyPaneProps {
  initial: PolicyDraft;
  account: PolicyPane_account$key;
  policy: PolicyPane_policy$key | null | undefined;
  user: PolicyPane_user$key;
}

export function PolicyPane({ initial, ...props }: PolicyPaneProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const create = useMutation<PolicyPane_createMutation>(Create);
  const update = useMutation<PolicyPane_updateMutation>(Update);

  const account = useFragment(Account, props.account);
  const policy = useFragment(Policy, props.policy);
  const user = useFragment(User, props.user);

  const [draft, setDraft] = useAtom(usePolicyDraftAtom());

  const isModified = !_.isEqual(initial, draft);
  const showSubmit = draft.key === undefined || isModified;
  const reset = useMemo(
    () => (isModified ? () => setDraft(initial) : undefined),
    [initial, isModified, setDraft],
  );

  if (!account) return null;

  return (
    <Pane flex>
      <PolicyAppbar policy={policy} reset={reset} />

      <SideSheetLayout>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <PolicyPresets account={account} user={user} />
          <ApprovalSettings />
          <SpendingSettings />
          <ActionsSettings />
          <SignMessageSettings />
          <DelaySettings />

          {showSubmit ? (
            <Fab
              icon={draft.key === undefined ? AddIcon : UpdateIcon}
              label={draft.key === undefined ? 'Create policy' : 'Update policy'}
              onPress={async () => {
                const input = { account: draft.account, ...asPolicyInput(draft) };
                const r =
                  input.key !== undefined
                    ? (await update({ input: { ...input, key: input.key! } })).updatePolicy
                    : (await create({ input })).createPolicy;

                if (r?.__typename !== 'Policy') return showError(r?.message);

                const p = r.draft ?? r;
                router.setParams({ ...params, id: p.id });
                if (p.proposal) {
                  router.push({
                    pathname: `/(nav)/transaction/[id]`,
                    params: { id: p.proposal.id },
                  });
                }
              }}
            />
          ) : (
            policy?.proposal &&
            policy.id === policy.draft?.id && (
              <Fab
                label="View proposal"
                onPress={() =>
                  router.push({
                    pathname: '/(nav)/transaction/[id]',
                    params: { id: policy.proposal!.id },
                  })
                }
              />
            )
          )}
        </ScrollView>

        <PolicySideSheet account={account} policy={policy} />
      </SideSheetLayout>
    </Pane>
  );
}

const styles = createStyles({
  container: {
    flexGrow: 1,
    gap: 8,
    paddingBottom: 80, // For FAB
  },
});
