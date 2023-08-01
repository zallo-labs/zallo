import { ScrollView } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { TabNavigatorScreenProp } from './Tabs';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { SelectedPolicy } from './SelectedPolicy';
import { makeStyles } from '@theme/makeStyles';
import { Hex } from 'lib';
import { gql, useFragment } from '@api/generated';
import { tryReplaceDocument, useQuery } from '~/gql';
import { useSubscription } from 'urql';

const FragmentDoc = gql(/* GraphQL */ `
  fragment PolicyTab_TransactionProposalFragment on TransactionProposal
  @argumentDefinitions(proposal: { type: "Bytes32!" }) {
    id
    account {
      id
      policies {
        id
        satisfiability(input: { proposal: $proposal }) {
          result
        }
        state {
          id
          threshold
          approvers {
            id
            address
          }
        }
      }
    }
    policy {
      id
    }
    rejections {
      id
      createdAt
      approver {
        id
        address
      }
    }
    approvals {
      id
      createdAt
      approver {
        id
        address
      }
    }
    ...SelectedPolicy_TransactionProposalFragment @arguments(proposal: $proposal)
  }
`);

const Query = gql(/* GraphQL */ `
  query PolicyTab($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
      ...PolicyTab_TransactionProposalFragment @arguments(proposal: $proposal)
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription PolicyTab_Subscription($proposal: Bytes32!) {
    proposal(input: { proposals: [$proposal] }) {
      ...PolicyTab_TransactionProposalFragment @arguments(proposal: $proposal)
    }
  }
`);

export interface PolicyTabParams {
  proposal: Hex;
}

export type PolicyTabProps = TabNavigatorScreenProp<'Policy'>;

export const PolicyTab = withSuspense(({ route }: PolicyTabProps) => {
  const styles = uesStyles();

  const { data } = useQuery(Query, { proposal: route.params.proposal });
  useSubscription({
    query: tryReplaceDocument(Subscription),
    variables: { proposal: route.params.proposal },
  });
  const p = useFragment(FragmentDoc, data?.proposal);

  if (!p) return null;

  const selected =
    p.account.policies.find(({ id }) => id === p.policy?.id) ?? p.account.policies[0];

  const remaining = selected.state && {
    approvals: Math.max(selected.state.threshold - p.approvals.length, 0),
    approvers: selected.state.approvers.filter(
      (approver) =>
        !p.approvals.find((a) => a.approver.address === approver.address) &&
        !p.rejections.find((r) => r.approver.address === approver.address),
    ),
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SelectedPolicy proposal={p} />

      {p.rejections.length > 0 && <ListHeader>Rejected</ListHeader>}
      {[...p.rejections].map((r) => (
        <ListItem
          key={r.id}
          leading={r.approver.address}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={r.approver.address} />
            </Text>
          )}
          supporting="Rejected"
          trailing={({ Text }) => (
            <Text>
              <Timestamp timestamp={r.createdAt} />
            </Text>
          )}
        />
      ))}

      {remaining && remaining.approvals > 0 && (
        <>
          <ListHeader>
            Awaiting for {remaining.approvals} approval{remaining.approvals !== 1 ? 's' : ''}
          </ListHeader>
          {remaining.approvers.map((approver) => (
            <ListItem
              key={approver.id}
              leading={approver.address}
              headline={({ Text }) => (
                <Text>
                  <AddressLabel address={approver.address} />
                </Text>
              )}
            />
          ))}
        </>
      )}

      {p.approvals.length > 0 && <ListHeader>Approvals</ListHeader>}
      {[...p.approvals].map((a) => (
        <ListItem
          key={a.id}
          leading={a.approver.address}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={a.approver.address} />
            </Text>
          )}
          trailing={({ Text }) => (
            <Text>
              <Timestamp timestamp={a.createdAt} />
            </Text>
          )}
        />
      ))}
    </ScrollView>
  );
}, TabScreenSkeleton);

const uesStyles = makeStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  unsatisfiable: {
    color: colors.error,
    margin: 16,
  },
}));
