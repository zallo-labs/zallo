import { ScrollView, StyleSheet, View } from 'react-native';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TabNavigatorScreenProp } from './Tabs';
import { Hex } from 'lib';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { DataView } from '~/components/DataView/DataView';
import { Text } from 'react-native-paper';
import { MessageIcon } from '~/components/proposal/MessageIcon';

const Query = gql(/* GraphQL */ `
  query MessageDetailsTab($proposal: Bytes32!) {
    messageProposal(input: { hash: $proposal }) {
      id
      label
      message
      typedData
      ...MessageIcon_MessageProposal
    }
  }
`);

export interface MessageDetailsTabParams {
  proposal: Hex;
}

export type MessageDetailsTabProps = TabNavigatorScreenProp<'MessageDetails'>;

export const MessageDetailsTab = withSuspense(({ route }: MessageDetailsTabProps) => {
  const p = useQuery(Query, { proposal: route.params.proposal }).data?.messageProposal;

  if (!p) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MessageIcon proposal={p} />
        <Text>
          <Text variant="titleMedium">{p.label || 'Signature request'}</Text>
        </Text>
      </View>

      <DataView>{p.typedData ?? p.message}</DataView>
    </ScrollView>
  );
}, TabScreenSkeleton);

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
