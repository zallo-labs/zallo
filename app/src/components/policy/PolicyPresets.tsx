import { FragmentType, gql, useFragment } from '@api';
import { createStyles, useStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { ScrollView, View } from 'react-native';
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {Object.values(presets).map((preset) => {
          const selected = policy.name === preset.name;
          return (
            <Chip
              key={preset.name}
              mode={selected ? 'flat' : 'outlined'}
              onPress={() => setDraft((d) => ({ ...d, ...preset }))}
              style={styles.chip(selected)}
              textStyle={styles.chipText(selected)}
            >
              {preset.name}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chip: (selected: boolean) => ({
    backgroundColor: selected ? colors.secondaryContainer : 'transparent',
  }),
  chipText: (selected: boolean) => ({
    color: selected ? colors.onSecondaryContainer : colors.onSurface,
  }),
}));
