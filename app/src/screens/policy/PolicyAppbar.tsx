import { WPolicy, useRemovePolicy } from '@api/policy';
import {
  PolicyActiveIcon,
  PolicyActiveOutlineIcon,
  PolicyAddIcon,
  PolicyEditIcon,
  PolicyEditOutlineIcon,
  UndoIcon,
} from '@theme/icons';
import { Menu } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { useConfirmRemoval } from '../alert/useConfirm';
import type { PolicyScreenParams, PolicyViewState } from './PolicyScreen';
import { ProposalId } from '@api/proposal';
import { P, match } from 'ts-pattern';
import { POLICY_DRAFT_ATOM } from './PolicyDraft';
import { useAtomValue } from 'jotai';
import { useNavigation } from '@react-navigation/native';

export interface PolicyAppbarProps {
  policy?: WPolicy;
  proposal?: ProposalId;
  state: PolicyViewState;
  reset?: () => void;
  setParams: (params: Partial<PolicyScreenParams>) => void;
}

export const PolicyAppbar = ({ policy, proposal, state, reset, setParams }: PolicyAppbarProps) => {
  const { navigate, goBack } = useNavigation();
  const removePolicy = useRemovePolicy();
  const confirmRemove = useConfirmRemoval({
    title: 'Remove policy',
    message: 'Are you sure you want to remove this policy?',
  });

  const { name } = useAtomValue(POLICY_DRAFT_ATOM);

  const switchState =
    state === 'active' && policy?.draft
      ? () => setParams({ state: 'draft' })
      : state === 'draft' && policy?.state
      ? () => setParams({ state: 'active' })
      : undefined;

  const StateIcon = match({ state, policy })
    .with({ policy: undefined }, () => PolicyAddIcon)
    .with({ state: 'active', policy: { draft: P.nullish } }, () => PolicyActiveOutlineIcon)
    .with({ state: 'active' }, () => PolicyActiveIcon)
    .with({ state: 'draft', policy: { state: P.nullish } }, () => PolicyEditOutlineIcon)
    .with({ state: 'draft' }, () => PolicyEditIcon)
    .exhaustive();

  return (
    <Appbar
      mode="large"
      leading="back"
      headline={name}
      trailing={[
        (props) => (reset ? <UndoIcon {...props} onPress={reset} /> : null),
        (props) => <StateIcon {...props} onPress={switchState} />,
        (props) => (
          <AppbarMore2 iconProps={props}>
            {({ close }) => (
              <>
                <Menu.Item
                  title="Rename policy"
                  onPress={() => {
                    close();
                    navigate('RenamePolicy', {});
                  }}
                />

                {proposal && (
                  <Menu.Item
                    title="View proposal"
                    onPress={() => {
                      close();
                      navigate('Proposal', { proposal });
                    }}
                  />
                )}

                {policy && (
                  <Menu.Item
                    title="Remove policy"
                    onPress={() => {
                      close();
                      confirmRemove({
                        onConfirm: async () => {
                          await removePolicy(policy);
                          goBack();
                        },
                      });
                    }}
                  />
                )}
              </>
            )}
          </AppbarMore2>
        ),
      ]}
    />
  );
};
