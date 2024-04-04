import { FragmentType, gql, useFragment } from '@api';
import { PolicyIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo } from 'react';
import { ScrollView, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
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

function PolicyPresets_(props: PolicyPresetsProps) {
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const presets = usePolicyPresets({ account, user, chain: account.chain });

  const policy = useAtomValue(usePolicyDraftAtom());
  const setDraft = useSetAtom(usePolicyDraftAtom());

  // Only show when creating policy
  if (policy.key !== undefined) return null;

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.title}>
        Use preset
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestions}
      >
        {Object.values(presets).map((preset) => (
          <Chip
            key={preset.name}
            mode="outlined"
            icon={PolicyIcon}
            onPress={() => setDraft((d) => ({ ...d, ...preset }))}
          >
            {preset.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = createStyles({
  container: {
    marginVertical: 8,
    gap: 8,
  },
  title: {
    marginHorizontal: 16,
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
  },
});

export const PolicyPresets = memo(PolicyPresets_);
