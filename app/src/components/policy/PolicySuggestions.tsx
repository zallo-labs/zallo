import { FragmentType, gql, useFragment } from '@api';
import { createStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/presets';

const Account = gql(/* GraphQL */ `
  fragment PolicySuggestions_Account on Account {
    id
    ...getPolicyPresets_Account
  }
`);

export interface PolicySuggestionsProps {
  account: FragmentType<typeof Account>;
}

export function PolicySuggestions(props: PolicySuggestionsProps) {
  const account = useFragment(Account, props.account);
  const presets = usePolicyPresets(account);

  const policy = useAtomValue(POLICY_DRAFT_ATOM);
  const setDraft = useSetAtom(POLICY_DRAFT_ATOM);

  // Only show when creating policy
  if (policy.key !== undefined) return null;

  return (
    <View style={styles.container}>
      <Text variant="labelLarge">Start from one of our presets</Text>
      <View style={styles.suggestions}>
        {Object.values(presets).map((preset) => (
          <Chip
            key={preset.name}
            mode="flat"
            onPress={() => setDraft((d) => ({ ...d, ...preset }))}
          >
            {preset.name}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const styles = createStyles({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
  },
});
