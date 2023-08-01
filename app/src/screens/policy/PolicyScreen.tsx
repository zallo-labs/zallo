import { Address, PolicyKey } from 'lib';
import { ScrollView } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { PolicyAppbar } from './PolicyAppbar';
import { POLICY_DRAFT_ATOM, PolicyDraft, asPolicyInput } from './PolicyDraft';
import { Permissions } from './Permissions';
import { useAtom } from 'jotai';
import _ from 'lodash';
import { Fab } from '~/components/buttons/Fab';
import { DoubleCheckIcon, NavigateNextIcon, SendIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useHydratePolicyDraft } from './useHydratePolicyDraft';
import { useQuery } from '~/gql';
import { NotFound } from '~/components/NotFound';
import { useMutation } from 'urql';

const Query = gql(/* GraphQL */ `
  query PolicyScreen($account: Address!, $key: PolicyKey!) {
    policy(input: { account: $account, key: $key }) {
      id
      state {
        id
      }
      ...UseHydratePolicyDraft_Policy
      ...PolicyView_Policy
    }
  }
`);

const Policy = gql(/* GraphQL */ `
  fragment PolicyView_Policy on Policy {
    id
    key
    ...PolicyAppbar_Policy
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

export type PolicyViewState = 'active' | 'draft';

export interface PolicyScreenParams {
  account: Address;
  key?: PolicyKey;
  view?: PolicyViewState;
}

export type PolicyScreenProps = StackNavigatorScreenProps<'Policy'>;

export const PolicyScreen = withSuspense((props: PolicyScreenProps) => {
  const { account, key } = props.route.params;
  const { policy } =
    useQuery(Query, { account, key: key! }, { pause: key === undefined }).data ?? {};

  const view = props.route.params.view ?? policy?.state ? 'active' : 'draft';
  const init = useHydratePolicyDraft(account, policy, view);

  if (key !== undefined && !policy) return <NotFound name="Policy" />;

  return <PolicyView {...props} policy={policy} init={init} view={view} />;
}, ScreenSkeleton);

interface PolicyViewProps extends Pick<PolicyScreenProps, 'navigation'> {
  policy: FragmentType<typeof Policy> | null | undefined;
  init: PolicyDraft;
  view: PolicyViewState;
}

const PolicyView = ({
  navigation: { navigate, setParams },
  policy: policyFragment,
  init,
  view,
}: PolicyViewProps) => {
  const policy = useFragment(Policy, policyFragment);
  const create = useMutation(Create)[1];
  const update = useMutation(Update)[1];

  const [draft, setDraft] = useAtom(POLICY_DRAFT_ATOM);
  const isModified = !_.isEqual(init, draft);

  return (
    <Screen>
      <PolicyAppbar
        policy={policy}
        view={view}
        reset={isModified ? () => setDraft(init) : undefined}
        setParams={setParams}
      />

      <ScrollView>
        <ListItem
          leading={DoubleCheckIcon}
          headline="Approvals"
          supporting={`${draft.threshold}/${draft.approvers.size} required`}
          trailing={NavigateNextIcon}
          onPress={() => navigate('Approvers', {})}
        />
        <Permissions />
      </ScrollView>

      {(!policy || isModified) && (
        <Fab
          icon={SendIcon}
          label={draft.key !== undefined ? 'Update' : 'Create'}
          onPress={async () => {
            const input = { ...asPolicyInput(draft), account: draft.account };
            const r = policy
              ? (await update({ input })).data?.updatePolicy
              : (await create({ input })).data?.createPolicy;

            setParams({ key: r?.key, view: 'draft' });
            const proposal = r?.draft?.proposal?.hash;
            if (proposal) navigate('Proposal', { proposal });
          }}
        />
      )}
    </Screen>
  );
};
