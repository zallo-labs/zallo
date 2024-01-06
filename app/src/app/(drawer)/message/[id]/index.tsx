import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { z } from 'zod';

import { asChain } from 'lib';
import { MessageLayoutParams } from '~/app/(drawer)/message/[id]/_layout';
import { DataView } from '~/components/DataView/DataView';
import { MessageIcon } from '~/components/message/MessageIcon';
import { RiskRating } from '~/components/proposal/RiskRating';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { useLocalParams } from '~/hooks/useLocalParams';

const Query = gql(/* GraphQL */ `
  query MessageDetailsTab($proposal: UUID!) {
    messageProposal(input: { id: $proposal }) {
      id
      label
      message
      typedData
      account {
        id
        address
      }
      ...MessageIcon_MessageProposal
      ...RiskRating_Proposal
    }
  }
`);

export const MessageDetailsTabParams = MessageLayoutParams;
export type MessageDetailsTabParams = z.infer<typeof MessageDetailsTabParams>;

function MessageDetailsTab() {
  const params = useLocalParams(MessageDetailsTabParams);
  const p = useQuery(Query, { proposal: params.id }).data?.messageProposal;

  if (!p) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MessageIcon proposal={p} />
        <Text>
          <Text variant="titleMedium">{p.label || 'Message'}</Text>
        </Text>
      </View>

      <DataView chain={asChain(p.account.address)}>{p.typedData ?? p.message}</DataView>

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

export default withSuspense(MessageDetailsTab, <ScreenSkeleton />);
