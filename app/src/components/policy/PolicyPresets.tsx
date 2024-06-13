import { FragmentType, gql, useFragment } from '@api';
import { createStyles, useStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { FlatList, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { usePolicyDraftAtom } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';

const Account = gql(/* GraphQL */ `
  fragment PolicyPresets_Account on Account {
    id
    chain
    ...UsePolicyPresets_Account
  }
`);

const User = gql(/* GraphQL */ `
  fragment PolicyPresets_User on User {
    id
    ...UsePolicyPresets_User
  }
`);

export interface PolicyPresetsProps {
  account: FragmentType<typeof Account>;
  user: FragmentType<typeof User>;
}

export function PolicyPresets(props: PolicyPresetsProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const presets = usePolicyPresets({ account, user, chain: account.chain });

  const policy = useAtomValue(usePolicyDraftAtom());
  const setDraft = useSetAtom(usePolicyDraftAtom());

  // Only show when creating policy
  if (policy.key !== undefined) return null;

  return (
    <View>
      <FlatList
        horizontal
        data={Object.values(presets)}
        renderItem={({ item: preset }) => (
          <Chip
            mode="outlined"
            onPress={() => setDraft((d) => ({ ...d, ...preset, key: d.key, name: d.name }))}
            style={styles.chip}
            textStyle={styles.chipText}
          >
            {preset.name}
          </Chip>
        )}
        contentContainerStyle={styles.container}
      />
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: 'transparent',
  },
  chipText: {
    color: colors.onSurface,
  },
}));
