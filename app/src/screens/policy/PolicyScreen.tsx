import { useCreatePolicy, usePolicy, useUpdatePolicy } from '@api/policy';
import { ALLOW_ALL_TARGETS, Address, PolicyKey, asPolicyKey } from 'lib';
import { ScrollView } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { PolicyAppbar } from './PolicyAppbar';
import { useApproverId } from '@network/useApprover';
import { Approvers } from './Approvers';
import { POLICY_DRAFT_ATOM, PolicyDraft } from './PolicyDraft';
import { Permissions } from './Permissions';
import { useEffect, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import _ from 'lodash';
import { Fab } from '~/components/buttons/Fab';
import { SendIcon } from '@theme/icons';

export type PolicyViewState = 'active' | 'draft';

export interface PolicyScreenParams {
  account: Address;
  key?: PolicyKey;
  state?: PolicyViewState;
}

export type PolicyScreenProps = StackNavigatorScreenProps<'Policy'>;

export const PolicyScreen = withSuspense((props: PolicyScreenProps) => {
  const { account, key } = props.route.params;
  const policy = usePolicy(key !== undefined ? { account, key } : undefined);
  const approver = useApproverId();

  const state = props.route.params.state ?? policy?.state ? 'active' : 'draft';

  const initState = useMemo(
    (): PolicyDraft => ({
      account,
      name: policy?.name ?? 'New policy',
      ...((state === 'active' && policy?.state) ||
        policy?.draft || {
          approvers: new Set([approver]),
          threshold: 1,
          permissions: {
            targets: ALLOW_ALL_TARGETS,
          },
        }),
    }),
    [account, policy, state, approver],
  );

  useHydrateAtoms([[POLICY_DRAFT_ATOM, initState]]);

  const setDraft = useSetAtom(POLICY_DRAFT_ATOM);
  useEffect(() => {
    setDraft(initState);
  }, [setDraft, initState]);

  return <PolicyView {...props} initState={initState} state={state} />;
}, ScreenSkeleton);

interface PolicyViewProps extends PolicyScreenProps {
  initState: PolicyDraft;
  state: PolicyViewState;
}

const PolicyView = ({
  route,
  navigation: { navigate, setParams },
  initState,
  state,
}: PolicyViewProps) => {
  const { account, key } = route.params;
  const createPolicy = useCreatePolicy(account);
  const updatePolicy = useUpdatePolicy();

  const policy = usePolicy(key !== undefined ? { account, key } : undefined);
  const proposal = (state === 'active' ? policy?.state : policy?.draft)?.proposal;

  const [draft, setDraft] = useAtom(POLICY_DRAFT_ATOM);
  const isModified = !_.isEqual(initState, draft);

  return (
    <Screen>
      <PolicyAppbar
        policy={policy}
        proposal={proposal}
        state={state}
        reset={isModified ? () => setDraft(initState) : undefined}
        setParams={setParams}
      />

      <ScrollView>
        <Permissions />
        <Approvers />
      </ScrollView>

      {(!policy || isModified) && (
        <Fab
          icon={SendIcon}
          label={draft.key !== undefined ? 'Update' : 'Create'}
          onPress={async () => {
            const r = await (draft.key !== undefined
              ? updatePolicy({ key: draft.key, ...draft })
              : createPolicy(draft));

            setParams({ key: r?.key ? asPolicyKey(r.key) : undefined, state: 'draft' });

            const proposal = r?.draft?.proposal?.hash;
            if (proposal) navigate('Proposal', { proposal });
          }}
        />
      )}
    </Screen>
  );
};
