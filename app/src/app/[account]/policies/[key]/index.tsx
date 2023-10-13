import { gql } from '@api';
import { DoubleCheckIcon, NavigateNextIcon, TransferIcon } from '@theme/icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { PolicyKey, asAddress, asPolicyKey } from 'lib';
import _ from 'lodash';
import { ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'urql';
import { z } from 'zod';
import { PoliciesScreenParams } from '~/app/[account]/policies';
import { Fab } from '~/components/Fab';
import { ListItem } from '~/components/list/ListItem';
import { Permissions } from '~/components/policy/Permissions';
import { PolicyAppbar } from '~/components/policy/PolicyAppbar';
import { useQuery } from '~/gql';
import { useHydratePolicyDraft } from '~/hooks/useHydratePolicyDraft';
import { useLocalParams } from '~/hooks/useLocalParams';
import { POLICY_DRAFT_ATOM, asPolicyInput } from '~/lib/policy/draft';
import { zAddress } from '~/lib/zod';
import { showError } from '~/components/provider/SnackbarProvider';

const Query = gql(/* GraphQL */ `
  query PolicyScreen($account: Address!, $key: PolicyKey!, $queryPolicy: Boolean!) {
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

    account(input: { address: $account }) {
      id
      address
      ...useHydratePolicyDraft_Account
    }
  }
`);

const Create = gql(/* GraphQL */ `
  mutation PolicyScreen_Create($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      id
      key
      draft {
        id
        proposal {
          id
          hash
        }
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation PolicyScreen_Update($input: UpdatePolicyInput!) {
    updatePolicy(input: $input) {
      id
      key
      draft {
        id
        proposal {
          id
          hash
        }
      }
    }
  }
`);

export const PolicyScreenParams = z.intersection(
  PoliciesScreenParams,
  z.object({
    key: z.union([z.coerce.number().transform(asPolicyKey), z.literal('add')]),
    view: z.enum(['state', 'draft']).optional(),
    template: z.enum(['low', 'medium', 'high']).optional(),
  }),
);
export type PolicyScreenParams = z.infer<typeof PolicyScreenParams>;

export default function PolicyScreen() {
  const params = useLocalParams(`/[account]/policies/[key]/`, PolicyScreenParams);
  const router = useRouter();
  const create = useMutation(Create)[1];
  const update = useMutation(Update)[1];

  const isAdd = params.key === 'add';
  const key = isAdd ? undefined : asPolicyKey(params.key);

  const { policy, account } = useQuery(Query, {
    account: asAddress(params.account),
    key: key ?? (0 as PolicyKey),
    queryPolicy: key !== undefined,
  }).data;

  const view =
    (params.view === 'state' && policy?.state && 'state') || (policy?.draft && 'draft') || 'state';

  const { init } = useHydratePolicyDraft({
    account: account!,
    policy,
    template: params.template ?? 'high',
    view,
  });

  const [draft, setDraft] = useAtom(POLICY_DRAFT_ATOM);
  const isModified = !_.isEqual(init, draft);

  if (!account) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PolicyAppbar
        account={account.address}
        policyKey={params.key}
        policy={policy}
        view={view}
        setView={(view) => router.setParams({ ...params, key: `${params.key}`, view })}
        reset={isModified ? () => setDraft(init) : undefined}
      />

      <ListItem
        leading={DoubleCheckIcon}
        headline="Approvals"
        supporting={`${draft.threshold}/${draft.approvers.size} required`}
        trailing={NavigateNextIcon}
        onPress={() =>
          router.push({
            pathname: `/[account]/policies/[key]/approvers`,
            params: { account: draft.account, key: draft.key ?? 'add' },
          })
        }
      />

      <Permissions account={account.address} policyKey={params.key} />

      {(draft.key === undefined || isModified) && (
        <Fab
          icon={TransferIcon}
          label={draft.key === undefined ? 'Create' : 'Update'}
          onPress={async () => {
            const input = { ...asPolicyInput(draft), account: draft.account };
            const r =
              input.key !== undefined
                ? (await update({ input })).data?.updatePolicy
                : (await create({ input })).data?.createPolicy;

            const proposal = r?.draft?.proposal;
            if (!proposal) return showError('Failed to propose changes');

            router.setParams({ ...params, key: `${r.key}`, view: 'draft' });
            router.push({ pathname: `/transaction/[hash]/`, params: { hash: proposal.hash } });
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
