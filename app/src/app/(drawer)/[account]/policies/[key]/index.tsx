import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import _ from 'lodash';
import { useMutation } from 'urql';
import { z } from 'zod';

import { asPolicyKey, PolicyKey } from 'lib';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { ActionsSettings } from '~/components/policy/ActionsSettings';
import { ApprovalSettings } from '~/components/policy/ApprovalSettings';
import { PolicyAppbar } from '~/components/policy/PolicyAppbar';
import { PolicySuggestions } from '~/components/policy/PolicySuggestions';
import { SpendingSettings } from '~/components/policy/SpendingSettings';
import { showError } from '~/components/provider/SnackbarProvider';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api';
import { useHydratePolicyDraft } from '~/hooks/useHydratePolicyDraft';
import { useLayout } from '~/hooks/useLayout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { asPolicyInput, POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { zUAddress } from '~/lib/zod';
import { createStyles } from '~/util/theme/styles';

const Query = gql(/* GraphQL */ `
  query PolicyScreen($account: UAddress!, $key: PolicyKey!, $queryPolicy: Boolean!) {
    policy(input: { account: $account, key: $key }) @include(if: $queryPolicy) {
      id
      key
      state {
        id
      }
      draft {
        id
      }
      ...useHydratePolicyDraft_Policy
      ...PolicyAppbar_Policy
    }

    account(input: { account: $account }) {
      id
      address
      ...useHydratePolicyDraft_Account
      ...PolicySuggestions_Account
    }
  }
`);

const Create = gql(/* GraphQL */ `
  mutation PolicyScreen_Create($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      __typename
      ... on Policy {
        id
        key
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
        key
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

export const PolicyScreenParams = z.object({
  account: zUAddress(),
  key: z.union([z.coerce.number().transform(asPolicyKey), z.literal('add')]),
  view: z.enum(['state', 'draft']).optional(),
});
export type PolicyScreenParams = z.infer<typeof PolicyScreenParams>;

function PolicyScreen() {
  const params = useLocalParams(PolicyScreenParams);
  const router = useRouter();
  const create = useMutation(Create)[1];
  const update = useMutation(Update)[1];

  const key = params.key === 'add' ? undefined : asPolicyKey(params.key);

  const { policy, account } = useQuery(Query, {
    account: params.account,
    key: key ?? (0 as PolicyKey),
    queryPolicy: key !== undefined,
  }).data;

  const view =
    (params.view === 'state' && policy?.state && 'state') || (policy?.draft && 'draft') || 'state';

  const { init } = useHydratePolicyDraft({ account, policy, view });
  const [draft, setDraft] = useAtom(POLICY_DRAFT_ATOM);
  const isModified = !_.isEqual(init, draft);
  const initiallyExpanded = useLayout().layout === 'expanded';

  if (!account) return null;

  return (
    <>
      <PolicyAppbar
        account={account.address}
        policyKey={params.key}
        policy={policy}
        view={view}
        setView={(view) => router.setParams({ ...params, key: `${params.key}`, view })}
        reset={isModified ? () => setDraft(init) : undefined}
      />

      <ScreenSurface contentContainerStyle={styles.container}>
        <PolicySuggestions account={account} />
        <ApprovalSettings initiallyExpanded={initiallyExpanded} />
        <SpendingSettings initiallyExpanded={initiallyExpanded} />
        <ActionsSettings initiallyExpanded={initiallyExpanded} />

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

                router.setParams({ ...params, key: `${r.key}`, view: 'draft' });
                router.push({
                  pathname: `/(drawer)/transaction/[id]/`,
                  params: { id: r.draft!.proposal!.id },
                });
              }}
            >
              {draft.key === undefined ? 'Create' : 'Update'}
            </Button>
          </Actions>
        )}
      </ScreenSurface>
    </>
  );
}

const styles = createStyles({
  container: {
    flexGrow: 1,
    paddingVertical: 8,
  },
});

export default withSuspense(PolicyScreen, ScreenSkeleton);
