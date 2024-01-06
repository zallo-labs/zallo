import { ScrollView, View } from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import { Chip, Text } from 'react-native-paper';

import { FragmentType, gql, useFragment } from '~/gql/api';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/presets';
import { PolicyIcon } from '~/util/theme/icons';
import { createStyles } from '~/util/theme/styles';

const Account = gql(/* GraphQL */ `
  fragment PolicySuggestions_Account on Account {
    id
    chain
    ...getPolicyPresets_Account
  }
`);

export interface PolicySuggestionsProps {
  account: FragmentType<typeof Account>;
}

export function PolicySuggestions(props: PolicySuggestionsProps) {
  const account = useFragment(Account, props.account);
  const presets = usePolicyPresets({ account, chain: account.chain });

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
