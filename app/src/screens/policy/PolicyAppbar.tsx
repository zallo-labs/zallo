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
import { P, match } from 'ts-pattern';
import { POLICY_DRAFT_ATOM } from './PolicyDraft';
import { useAtomValue } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';

const Policy = gql(/* GraphQL */ `
  fragment PolicyAppbar_Policy on Policy {
    id
    key
    account {
      id
      address
    }
    state {
      id
      proposal {
        id
        hash
      }
    }
    draft {
      id
      proposal {
        id
        hash
      }
    }
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation PolicyAppbar_Remove($account: Address!, $key: PolicyKey!) {
    removePolicy(input: { account: $account, key: $key }) {
      id
    }
  }
`);

export interface PolicyAppbarProps {
  policy?: FragmentType<typeof Policy> | null;
  view: PolicyViewState;
  reset?: () => void;
  setParams: (params: Partial<PolicyScreenParams>) => void;
}

export const PolicyAppbar = ({ view, reset, setParams, ...props }: PolicyAppbarProps) => {
  const policy = useFragment(Policy, props.policy);
  const { navigate, goBack } = useNavigation();
  const remove = useMutation(Remove)[1];
  const confirmRemove = useConfirmRemoval({
    title: 'Remove policy',
    message: 'Are you sure you want to remove this policy?',
  });

  const { name } = useAtomValue(POLICY_DRAFT_ATOM);

  const state = view === 'active' ? policy?.state : policy?.draft;

  const switchState =
    view === 'active' && policy?.draft
      ? () => setParams({ view: 'draft' })
      : view === 'draft' && policy?.state
      ? () => setParams({ view: 'active' })
      : undefined;

  const StateIcon = match({ state: view, policy })
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

                {state?.proposal && (
                  <Menu.Item
                    title="View proposal"
                    onPress={() => {
                      close();
                      navigate('Proposal', { proposal: state.proposal!.hash });
                    }}
                  />
                )}

                {policy && (
                  <Menu.Item
                    title="Remove policy"
                    onPress={async () => {
                      close();
                      if (await confirmRemove()) {
                        await remove({ account: policy.account.address, key: policy.key });
                        goBack();
                      }
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
