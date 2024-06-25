import { SettingsOutlineIcon, SwapIcon, UndoIcon } from '@theme/icons';
import { Chip, Menu } from 'react-native-paper';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { useAtomValue, useSetAtom } from 'jotai';
import { FragmentType, gql, useFragment } from '@api/generated';
import { usePolicyDraftAtom } from '~/lib/policy/draft';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { Appbar } from '#/Appbar/Appbar';
import { SIDE_SHEET } from '#/SideSheet/SideSheetLayout';

const Policy = gql(/* GraphQL */ `
  fragment PolicyAppbar_Policy on Policy {
    id
    key
    isActive
    latest {
      id
    }
    draft {
      id
    }
    proposal {
      id
    }
  }
`);

export interface PolicyAppbarProps {
  policy?: FragmentType<typeof Policy> | null;
  reset?: () => void;
}

export function PolicyAppbar({ reset, ...props }: PolicyAppbarProps) {
  const { styles } = useStyles(stylesheet);
  const policy = useFragment(Policy, props.policy);
  const router = useRouter();
  const params = useLocalSearchParams();
  const showSheet = useSetAtom(SIDE_SHEET);

  const { name } = useAtomValue(usePolicyDraftAtom());

  const state =
    (policy?.isActive && 'Active') ||
    ((!policy || policy.id === policy.draft?.id) && 'Draft') ||
    'Historic';

  const switchState =
    (policy?.id !== policy?.latest?.id && policy?.latest?.id) ||
    (policy?.id !== policy?.draft?.id && policy?.draft?.id);

  return (
    <Appbar
      mode="large"
      headline={name}
      trailing={[
        (props) => (reset ? <UndoIcon {...props} onPress={reset} /> : null),
        (iconProps) =>
          switchState ? (
            <Chip
              mode="flat"
              onPress={() => router.setParams({ ...params, id: switchState })}
              icon={() => <SwapIcon {...iconProps} style={styles.pressableStateChipLabel} />}
              style={styles.pressableStateChipContainer}
              textStyle={styles.pressableStateChipLabel}
            >
              {state}
            </Chip>
          ) : (
            <Chip
              mode="outlined"
              style={styles.unpressableStateContainer}
              textStyle={styles.unpressableStateChipLabel}
            >
              {state}
            </Chip>
          ),
        (props) => <SettingsOutlineIcon {...props} onPress={() => showSheet((s) => !s)} />,
        (iconProps) =>
          policy?.proposal && (
            <AppbarMore iconProps={iconProps}>
              {({ handle }) => (
                <Menu.Item
                  title="View proposal"
                  onPress={handle(() =>
                    router.push({
                      pathname: `/(nav)/transaction/[id]`,
                      params: { id: policy.proposal!.id },
                    }),
                  )}
                />
              )}
            </AppbarMore>
          ),
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
  unpressableStateContainer: {
    backgroundColor: 'transparent',
  },
  unpressableStateChipLabel: {
    color: colors.onSurface,
  },
}));
