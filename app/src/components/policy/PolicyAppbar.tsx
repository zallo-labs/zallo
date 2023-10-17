import {
  PolicyActiveIcon,
  PolicyActiveOutlineIcon,
  PolicyAddIcon,
  PolicyEditIcon,
  PolicyEditOutlineIcon,
  UndoIcon,
} from '@theme/icons';
import { Menu } from 'react-native-paper';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { P, match } from 'ts-pattern';
import { useAtomValue } from 'jotai';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { PolicyView } from '~/hooks/useHydratePolicyDraft';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';
import { Address, PolicyKey } from 'lib';

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
      isRemoved
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

export interface PolicyAppbarProps {
  account: Address;
  policyKey: PolicyKey | 'add';
  policy?: FragmentType<typeof Policy> | null;
  view: PolicyView;
  setView: (view: PolicyView) => void;
  reset?: () => void;
}

export function PolicyAppbar({ view, reset, setView, ...props }: PolicyAppbarProps) {
  const router = useRouter();
  const policy = useFragment(Policy, props.policy);
  const remove = useMutation(Remove)[1];
  const confirmRemove = useConfirmRemoval({
    title: 'Remove policy',
    message: 'Are you sure you want to remove this policy?',
  });

  const { name } = useAtomValue(POLICY_DRAFT_ATOM);

  const state = view === 'state' ? policy?.state : policy?.draft;

  const switchState =
    view === 'state' && policy?.draft
      ? () => setView('draft')
      : view === 'draft' && policy?.state
      ? () => setView('state')
      : undefined;

  const StateIcon = match({ state: view, policy })
    .with({ policy: undefined }, () => PolicyAddIcon)
    .with({ state: 'state', policy: { draft: P.nullish } }, () => PolicyActiveOutlineIcon)
    .with({ state: 'state' }, () => PolicyActiveIcon)
    .with({ state: 'draft', policy: { state: P.nullish } }, () => PolicyEditOutlineIcon)
    .with({ state: 'draft' }, () => PolicyEditIcon)
    .exhaustive();

  return (
    <AppbarOptions
      mode="large"
      headline={name}
      trailing={[
        (props) => (reset ? <UndoIcon {...props} onPress={reset} /> : null),
        (props) => <StateIcon {...props} onPress={switchState} />,
        (iconProps) => (
          <AppbarMore iconProps={iconProps}>
            {({ close }) => (
              <>
                <Menu.Item
                  title="Rename policy"
                  onPress={() => {
                    close();
                    router.push({
                      pathname: `/[account]/policies/[key]/name`,
                      params: { account: props.account, key: props.policyKey },
                    });
                  }}
                />

                {state?.proposal && (
                  <Menu.Item
                    title="View proposal"
                    onPress={() => {
                      close();
                      router.push({
                        pathname: `/(drawer)/transaction/[hash]/`,
                        params: { hash: state.proposal!.hash },
                      });
                    }}
                  />
                )}

                {policy && !policy.draft?.isRemoved && (
                  <Menu.Item
                    title="Remove policy"
                    onPress={async () => {
                      close();
                      if (await confirmRemove()) {
                        const proposal = (
                          await remove({ account: policy.account.address, key: policy.key })
                        ).data?.removePolicy.draft?.proposal;

                        proposal
                          ? router.push({
                              pathname: `/(drawer)/transaction/[hash]/`,
                              params: { hash: proposal.hash },
                            })
                          : router.back();
                      }
                    }}
                  />
                )}
              </>
            )}
          </AppbarMore>
        ),
      ]}
    />
  );
}
