import { AccountId } from '@api/account';
import { useCreatePolicy, usePolicy, useUpdatePolicy } from '@api/policy';
import { DEFAULT_TARGETS, asPolicyKey } from 'lib';
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
import { SendOutlineIcon } from '@theme/icons';
import { asProposalId } from '@api/proposal';

export type PolicyViewState = 'active' | 'draft';

export interface PolicyScreenParams {
  account: AccountId;
  key?: string;
  state?: PolicyViewState;
}

export type PolicyScreenProps = StackNavigatorScreenProps<'Policy'>;

export const PolicyScreen = withSuspense((props: PolicyScreenProps) => {
  const { account, key } = props.route.params;
  const policy = usePolicy(key ? { account, key: asPolicyKey(key) } : undefined);
  const approverId = useApproverId();

  const state = props.route.params.state ?? policy?.active ? 'active' : 'draft';

  const initState = useMemo(
    (): PolicyDraft => ({
      account,
      name: policy?.name ?? 'New policy',
      ...((state === 'active' && policy?.active) ||
        policy?.draft || {
          approvers: new Set([approverId]),
          threshold: 1,
          permissions: {
            targets: DEFAULT_TARGETS,
          },
        }),
    }),
    [account, policy, state, approverId],
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

const PolicyView = ({ route, navigation, initState, state }: PolicyViewProps) => {
  const { account: accountId, key } = route.params;
  const createPolicy = useCreatePolicy(accountId);
  const updatePolicy = useUpdatePolicy();

  const policy = usePolicy(key ? { account: accountId, key: asPolicyKey(key) } : undefined);
  const proposal = (state === 'active' ? policy?.active : policy?.draft)?.proposal;

  const [draft, setDraft] = useAtom(POLICY_DRAFT_ATOM);
  const isModified = !_.isEqual(initState, draft);

  return (
    <Screen>
      <PolicyAppbar
        policy={policy}
        proposal={proposal}
        state={state}
        reset={isModified ? () => setDraft(initState) : undefined}
        setParams={navigation.setParams}
      />

      <ScrollView>
        <Permissions />
        <Approvers />
      </ScrollView>

      {isModified && (
        <Fab
          icon={SendOutlineIcon}
          label="Propose changes"
          onPress={async () => {
            const r = await (draft.key
              ? updatePolicy({ key: draft.key, ...draft })
              : createPolicy(draft));
            const proposal = r?.draft?.proposalId;
            if (proposal) navigation.navigate('Proposal', { proposal: asProposalId(proposal) });
          }}
        />
      )}
    </Screen>
  );
};
