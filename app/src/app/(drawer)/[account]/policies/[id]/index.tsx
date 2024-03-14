import { gql } from '@api';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { PolicyKey } from 'lib';
import _ from 'lodash';
import { useMutation } from 'urql';
import { z } from 'zod';
import { PolicyAppbar } from '#/policy/PolicyAppbar';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { usePolicyDraftAtom, asPolicyInput, usePolicyDraftContext } from '~/lib/policy/draft';
import { showError } from '#/provider/SnackbarProvider';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { ApprovalSettings } from '#/policy/ApprovalSettings';
import { SpendingSettings } from '#/policy/SpendingSettings';
import { useLayout } from '~/hooks/useLayout';
import { ActionsSettings } from '#/policy/ActionsSettings';
import { PolicySuggestions } from '#/policy/PolicySuggestions';
import { createStyles } from '@theme/styles';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { PolicySideSheet } from '#/policy/PolicySideSheet';
import { SignMessageSettings } from '#/policy/SignMessageSettings';
import { DelaySettings } from '#/policy/DelaySettings';
import { PolicyLayoutParams, ZERO_UUID } from './_layout';

const Query = gql(/* GraphQL */ `
  query PolicyScreen($account: UAddress!, $policy: ID!, $includePolicy: Boolean!) {
    policy: policyState(id: $policy) @include(if: $includePolicy) {
      id
      ...PolicyAppbar_Policy
      ...PolicySideSheet_Policy
    }

    account(input: { account: $account }) {
      id
      address
      ...PolicySuggestions_Account
      ...PolicySideSheet_Account
    }

    user {
      id
      ...PolicySuggestions_User
    }
  }
`);

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

export const PolicyScreenParams = PolicyLayoutParams;
export type PolicyScreenParams = z.infer<typeof PolicyScreenParams>;

function PolicyScreen() {
  const params = useLocalParams(PolicyScreenParams);
  const router = useRouter();
  const create = useMutation(Create)[1];
  const update = useMutation(Update)[1];

  const { id, initial: init } = usePolicyDraftContext();
  const [draft, setDraft] = useAtom(usePolicyDraftAtom());

  const { policy, account, user } = useQuery(Query, {
    account: params.account,
    policy: id || ZERO_UUID,
    includePolicy: !!id,
  }).data;

  const isModified = !_.isEqual(init, draft);
  const initiallyExpanded = useLayout().layout === 'expanded';

  if (!account) return null;

  return (
    <SideSheetLayout>
      <PolicyAppbar policy={policy} reset={isModified ? () => setDraft(init) : undefined} />

      <ScrollableScreenSurface contentContainerStyle={styles.container}>
        <PolicySuggestions account={account} user={user} />
        <ApprovalSettings initiallyExpanded={initiallyExpanded} />
        <SpendingSettings initiallyExpanded={initiallyExpanded} />
        <ActionsSettings initiallyExpanded={initiallyExpanded} />
        <SignMessageSettings />
        <DelaySettings />

        {(draft.key === undefined || isModified) && (
          <Actions>
            <Button
              mode="contained"
              onPress={async () => {
                const input = { ...asPolicyInput(draft), account: draft.account, key: draft?.key };
                const r =
                  input.key !== undefined
                    ? (await update({ input: { ...input, key: input.key! } })).data?.updatePolicy
                    : (await create({ input })).data?.createPolicy;

                if (r?.__typename !== 'Policy') return showError(r?.message);

                const p = r.draft ?? r;
                router.setParams({ ...params, id: p.id });
                if (p.proposal) {
                  router.push({
                    pathname: `/(drawer)/transaction/[id]`,
                    params: { id: p.proposal.id },
                  });
                }
              }}
            >
              {draft.key === undefined ? 'Create' : 'Update'}
            </Button>
          </Actions>
        )}
      </ScrollableScreenSurface>

      <PolicySideSheet account={account} policy={policy} />
    </SideSheetLayout>
  );
}

const styles = createStyles({
  container: {
    flexGrow: 1,
    paddingVertical: 8,
  },
});

export default withSuspense(PolicyScreen, ScreenSkeleton);
