import { Timestamp } from '#/format/Timestamp';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { match } from 'ts-pattern';
import { materialCommunityIcon } from '@theme/icons';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from './OperationLabel';
import { ProposalValue } from './ProposalValue';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { OperationIcon } from '#/transaction/OperationIcon';
import { Image } from 'expo-image';

const Proposal = gql(/* GraphQL */ `
  fragment TransactionItem_TransactionProposal on TransactionProposal {
    id
    label
    status
    createdAt
    updatable
    iconUri
    account {
      id
      chain
    }
    operations {
      to
      ...OperationIcon_Operation
      ...OperationLabel_OperationFragment
    }
    transaction {
      id
      scheduledFor
      receipt {
        id
        timestamp
      }
    }
    potentialApprovers {
      id
    }
    ...ProposalValue_TransactionProposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment TransactionItem_User on User {
    id
    approvers {
      id
    }
  }
`);

const MultiOperationIcon = materialCommunityIcon('multiplication');

export interface TransactionItemProps extends Partial<ListItemProps> {
  proposal: FragmentType<typeof Proposal>;
  user: FragmentType<typeof User>;
}

function TransactionItem_({
  proposal: proposalFragment,
  user: userFragment,
  ...itemProps
}: TransactionItemProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Proposal, proposalFragment);
  const user = useFragment(User, userFragment);

  const isMulti = p.operations.length > 1;
  const canApprove =
    p.updatable && p.potentialApprovers.find((a) => user.approvers.find((ua) => a.id === ua.id));

  const supporting = match(p)
    .returnType<ListItemProps['supporting']>()
    .with({ status: 'Pending' }, () =>
      canApprove
        ? ({ Text }) => <Text style={styles.pending}>Approval required</Text>
        : 'Awaiting approval',
    )
    .with({ status: 'Scheduled' }, (p) => ({ Text }) => (
      <Text style={styles.scheduled}>
        Scheduled for <Timestamp timestamp={p.transaction!.scheduledFor!} time />
      </Text>
    ))
    .with({ status: 'Executing' }, () => 'Executing...')
    .with(
      { status: 'Successful' },
      () => p.transaction?.receipt && <Timestamp timestamp={p.transaction.receipt.timestamp} />,
    )
    .with(
      { status: 'Failed' },
      () =>
        ({ Text }) =>
          p.transaction?.receipt && (
            <Text style={styles.failed}>
              <Timestamp timestamp={p.transaction.receipt.timestamp} />
            </Text>
          ),
    )
    .with({ status: 'Cancelled' }, () => ({ Text }) => (
      <Text style={styles.cancelled}>Cancelled</Text>
    ))
    .exhaustive();

  return (
    <Link href={{ pathname: `/(drawer)/transaction/[id]`, params: { id: p.id } }} asChild>
      <ListItem
        leading={(props) =>
          p.iconUri ? (
            <Image source={{ uri: p.iconUri }} style={styles.icon} {...props} />
          ) : isMulti ? (
            <MultiOperationIcon {...props} style={styles.icon} />
          ) : (
            <OperationIcon operation={p.operations[0]} chain={p.account.chain} {...props} />
          )
        }
        leadingSize="medium"
        headline={
          p.label ??
          (isMulti ? (
            `${p.operations.length} operations`
          ) : (
            <OperationLabel operation={p.operations[0]} chain={p.account.chain} />
          ))
        }
        supporting={supporting}
        trailing={({ Text }) => (
          <Text variant="labelLarge">
            <ProposalValue proposal={p} hideZero />
          </Text>
        )}
        {...itemProps}
      />
    </Link>
  );
}

const stylesheet = createStyles(({ colors, iconSize, corner }) => ({
  pending: {
    color: colors.primary,
  },
  scheduled: {
    color: colors.tertiary,
  },
  failed: {
    color: colors.error,
  },
  cancelled: {
    color: colors.warning,
  },
  icon: {
    width: iconSize.medium,
    height: iconSize.medium,
    borderRadius: corner.l,
  },
}));

export const TransactionItem = withSuspense(
  TransactionItem_,
  <ListItemSkeleton leading supporting />,
);
