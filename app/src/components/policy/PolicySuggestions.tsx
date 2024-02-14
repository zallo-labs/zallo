import { FragmentType, gql, useFragment } from '@api';
import { PolicyIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { ScrollView, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';

const Account = gql(/* GraphQL */ `
  fragment PolicySuggestions_Account on Account {
    id
    chain
    ...UsePolicyPresets_Account
  }
`);

const User = gql(/* GraphQL */ `
  fragment PolicySuggestions_User on User {
    id
    ...UsePolicyPresets_User
  }
`);

export interface PolicySuggestionsProps {
  account: FragmentType<typeof Account>;
  user: FragmentType<typeof User>;
}

export function PolicySuggestions(props: PolicySuggestionsProps) {
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const presets = usePolicyPresets({ account, user, chain: account.chain });

  const policy = useAtomValue(POLICY_DRAFT_ATOM);
  const setDraft = useSetAtom(POLICY_DRAFT_ATOM);

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
