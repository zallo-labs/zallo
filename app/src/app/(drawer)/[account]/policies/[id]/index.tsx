import { gql } from '@api';
import { Link, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
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
import { PolicyPresets } from '#/policy/PolicyPresets';
import { createStyles } from '@theme/styles';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { PolicySideSheet } from '#/policy/PolicySideSheet';
import { SignMessageSettings } from '#/policy/SignMessageSettings';
import { DelaySettings } from '#/policy/DelaySettings';
import { PolicyLayoutParams, ZERO_UUID } from './_layout';
import { useMemo } from 'react';

const Query = gql(/* GraphQL */ `
  query PolicyScreen($account: UAddress!, $policy: ID!, $includePolicy: Boolean!) {
    policy: node(id: $policy) @include(if: $includePolicy) {
      __typename
      ... on Policy {
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
    }

    account(input: { account: $account }) {
      id
      address
      ...PolicyPresets_Account
      ...PolicySideSheet_Account
    }

    user {
      id
      ...PolicyPresets_User
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
  const showSubmit = draft.key === undefined || isModified;
  const initiallyExpanded = useLayout().layout === 'expanded';
  const reset = useMemo(
    () => (isModified ? () => setDraft(init) : undefined),
    [init, isModified, setDraft],
  );

  if (!account || (policy && policy.__typename !== 'Policy')) return null;

  return (
    <SideSheetLayout>
      <PolicyAppbar policy={policy} reset={reset} />

      <ScrollableScreenSurface contentContainerStyle={styles.container}>
        <PolicyPresets account={account} user={user} />
        <ApprovalSettings initiallyExpanded={initiallyExpanded} />
        <SpendingSettings initiallyExpanded={initiallyExpanded} />
        <ActionsSettings initiallyExpanded={initiallyExpanded} />
        <SignMessageSettings />
        <DelaySettings />

        <Actions>
          {showSubmit ? (
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
          ) : (
            policy?.proposal &&
            policy?.id === policy?.draft?.id && (
              <Link
                href={{
                  pathname: '/(drawer)/transaction/[id]',
                  params: { id: policy.proposal.id },
                }}
                asChild
              >
                <Button mode="contained">View proposal</Button>
              </Link>
            )
          )}
        </Actions>
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

export { ErrorBoundary } from '#/ErrorBoundary';
