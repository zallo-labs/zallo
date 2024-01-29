import { SettingsOutlineIcon, SwapIcon, UndoIcon } from '@theme/icons';
import { Chip, Menu } from 'react-native-paper';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { useAtomValue } from 'jotai';
import { FragmentType, gql, useFragment } from '@api/generated';
import { PolicyView } from '~/hooks/useHydratePolicyDraft';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';
import { PolicyKey, UAddress } from 'lib';
import { createStyles, useStyles } from '@theme/styles';

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
      }
    }
    draft {
      id
      proposal {
        id
      }
    }
  }
`);

export interface PolicyAppbarProps {
  account: UAddress;
  policyKey: PolicyKey | 'add';
  policy?: FragmentType<typeof Policy> | null;
  view: PolicyView;
  setView: (view: PolicyView) => void;
  reset?: () => void;
  openSettings: () => void;
}

export function PolicyAppbar({ view, setView, reset, openSettings, ...props }: PolicyAppbarProps) {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const policy = useFragment(Policy, props.policy);

  const { name } = useAtomValue(POLICY_DRAFT_ATOM);

  const state = view === 'state' ? policy?.state : policy?.draft;
  const stateChipLabel = view === 'draft' || !policy ? 'Draft' : 'Active';
  const switchState =
    view === 'state' && policy?.draft
      ? () => setView('draft')
      : view === 'draft' && policy?.state
        ? () => setView('state')
        : undefined;

  return (
    <AppbarOptions
      mode="large"
      headline={name}
      trailing={[
        (props) => (reset ? <UndoIcon {...props} onPress={reset} /> : null),
        () =>
          switchState ? (
            <Chip
              mode="flat"
              onPress={switchState}
              icon={(props) => <SwapIcon {...props} style={styles.pressableStateChipLabel} />}
              style={styles.pressableStateChipContainer}
              textStyle={styles.pressableStateChipLabel}
            >
              {stateChipLabel}
            </Chip>
          ) : (
            <Chip mode="outlined" textStyle={styles.unpressableStateChipLabel}>
              {stateChipLabel}
            </Chip>
          ),
        (props) => <SettingsOutlineIcon {...props} onPress={openSettings} />,
        (iconProps) =>
          state?.proposal ? (
            <AppbarMore iconProps={iconProps}>
              {({ close }) => (
                <Menu.Item
                  title="View proposal"
                  onPress={() => {
                    close();
                    router.push({
                      pathname: `/(drawer)/transaction/[id]`,
                      params: { id: state.proposal!.id },
                    });
                  }}
                />
              )}
            </AppbarMore>
          ) : null,
      ]}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  pressableStateChipContainer: {
    backgroundColor: colors.tertiary,
  },
  pressableStateChipLabel: {
    color: colors.onTertiary,
  },
  unpressableStateChipLabel: {
    color: colors.tertiary,
  },
}));
