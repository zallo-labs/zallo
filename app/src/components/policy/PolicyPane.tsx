import { FragmentType, gql, useFragment } from '@api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import _ from 'lodash';
import { useMutation } from 'urql';
import { PolicyAppbar } from '#/policy/PolicyAppbar';
import { usePolicyDraftAtom, asPolicyInput, PolicyDraft } from '~/lib/policy/draft';
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

const Create = gql(/* GraphQL */ `
  mutation PolicyScreen_Create($input: CreatePolicyInput!) {
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
`);

const Update = gql(/* GraphQL */ `
  mutation PolicyScreen_Update($input: UpdatePolicyInput!) {
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
`);

const Account = gql(/* GraphQL */ `
  fragment PolicyPane_Account on Account {
    id
    address
    ...PolicyPresets_Account
    ...PolicySideSheet_Account
  }
`);

const Policy = gql(/* GraphQL */ `
  fragment PolicyPane_Policy on Policy {
    id
    draft {
      id
    }
    proposal {
      id
    }
    ...PolicyAppbar_Policy
    ...PolicySideSheet_Policy
  }
`);

const User = gql(/* GraphQL */ `
  fragment PolicyPane_User on User {
    id
    ...PolicyPresets_User
  }
`);

export interface PolicyPaneProps {
  initial: PolicyDraft;
  account: FragmentType<typeof Account>;
  policy: FragmentType<typeof Policy> | null | undefined;
  user: FragmentType<typeof User>;
}

export function PolicyPane({ initial, ...props }: PolicyPaneProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const create = useMutation(Create)[1];
  const update = useMutation(Update)[1];

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

  if (!account || (policy && policy.__typename !== 'Policy')) return null;

  return (
    <Pane flex>
      <PolicyAppbar policy={policy} reset={reset} />

      <SideSheetLayout>
        <ScrollView contentContainerStyle={styles.container}>
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
                    ? (await update({ input: { ...input, key: input.key! } })).data?.updatePolicy
                    : (await create({ input })).data?.createPolicy;

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
