import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { TransactionActions } from '~/components/transaction/TransactionActions';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { TopTabs } from '~/components/layout/TopTabs';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { zUuid } from '~/lib/zod';
import { RemoveTransactionItem } from '~/components/transaction/RemoveTransactionItem';
import { TransactionStatus } from '~/components/transaction/TransactionStatus';

const Query = gql(/* GraphQL */ `
  query TransactionLayout($proposal: UUID!) {
    transactionProposal(input: { id: $proposal }) {
      id
      account {
        id
        name
      }
      ...TransactionStatus_TransactionProposal
      ...TransactionActions_TransactionProposal @arguments(proposal: $proposal)
    }

    user {
      id
      ...TransactionActions_User
    }
  }
`);

export const TransactionLayoutParams = z.object({ id: zUuid() });

export default function TransactionLayout() {
  const { id } = useLocalParams(TransactionLayoutParams);

  const query = useQuery(Query, { proposal: id });
  const { transactionProposal: proposal, user } = query.data;

  if (!proposal) return query.stale ? null : <NotFound name="Proposal" />;

  return (
    <>
      <AppbarOptions
        headline={proposal.account.name}
        trailing={(props) => (
          <AppbarMore iconProps={props}>
            {({ close }) => <RemoveTransactionItem proposal={id} close={close} />}
          </AppbarMore>
        )}
      />

      <ScreenSurface>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <TransactionStatus proposal={proposal} />

          <TopTabs>
            <TopTabs.Screen
              name="index"
              options={{ title: 'Transaction' }}
              initialParams={{ id }}
            />
            <TopTabs.Screen
              name="approvals"
              options={{ title: 'Approvals' }}
              initialParams={{ id }}
            />
          </TopTabs>

          <TransactionActions proposal={proposal} user={user} />
        </ScrollView>
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
