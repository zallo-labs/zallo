import { createStyles, useStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { FlatList, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { PolicyPresets_account$key } from '~/api/__generated__/PolicyPresets_account.graphql';
import { PolicyPresets_user$key } from '~/api/__generated__/PolicyPresets_user.graphql';
import { usePolicyDraftAtom } from '~/lib/policy/policyAsDraft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';

const Account = graphql`
  fragment PolicyPresets_account on Account {
    id
    chain
    ...usePolicyPresets_account
  }
`;

const User = graphql`
  fragment PolicyPresets_user on User {
    id
    ...usePolicyPresets_user
  }
`;

export interface PolicyPresetsProps {
  account: PolicyPresets_account$key;
  user: PolicyPresets_user$key;
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
        showsHorizontalScrollIndicator={false}
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
