import { z } from 'zod';
import { MessageLayoutParams } from '~/app/(drawer)/message/[hash]/_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ScrollView, StyleSheet, View } from 'react-native';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { DataView } from '~/components/DataView/DataView';
import { Text } from 'react-native-paper';
import { MessageIcon } from '~/components/proposal/MessageIcon';
import { RiskRating } from '~/components/proposal/RiskRating';

const Query = gql(/* GraphQL */ `
  query MessageDetailsTab($proposal: Bytes32!) {
    messageProposal(input: { hash: $proposal }) {
      id
      label
      message
      typedData
      ...MessageIcon_MessageProposal
      ...RiskRating_Proposal
    }
  }
`);

export const MessageDetailsTabParams = MessageLayoutParams;
export type MessageDetailsTabParams = z.infer<typeof MessageDetailsTabParams>;

export default function MessageDetailsTab() {
  const params = useLocalParams(`/(drawer)/message/[hash]/`, MessageDetailsTabParams);
  const p = useQuery(Query, { proposal: params.hash }).data?.messageProposal;

  if (!p) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MessageIcon proposal={p} />
        <Text>
          <Text variant="titleMedium">{p.label || 'Message'}</Text>
        </Text>
      </View>

      <DataView>{p.typedData ?? p.message}</DataView>

      <RiskRating proposal={p} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    marginHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});
