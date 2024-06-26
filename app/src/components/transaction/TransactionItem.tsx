import { Timestamp } from '#/format/Timestamp';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { match } from 'ts-pattern';
import { ActionIcon } from '@theme/icons';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from './OperationLabel';
import { ProposalValue } from './ProposalValue';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { OperationIcon } from '#/transaction/OperationIcon';
import { Image } from '#/Image';
import { ICON_SIZE } from '@theme/paper';

const Transaction = gql(/* GraphQL */ `
  fragment TransactionItem_Transaction on Transaction {
    id
    label
    status
    createdAt
    updatable
    icon
    account {
      id
      chain
    }
    operations {
      to
      ...OperationIcon_Operation
      ...OperationLabel_OperationFragment
    }
    result {
      __typename
      id
      timestamp
      ... on Scheduled {
        scheduledFor
      }
    }
    approvals {
      id
      approver {
        id
      }
    }
    policy {
      id
      approvers {
        id
      }
    }
    ...ProposalValue_Transaction
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

export interface TransactionItemProps extends Partial<ListItemProps> {
  transaction: FragmentType<typeof Transaction>;
  user: FragmentType<typeof User>;
}

function TransactionItem_({
  transaction: txFragment,
  user: userFragment,
  ...itemProps
}: TransactionItemProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, txFragment);
  const user = useFragment(User, userFragment);

  const isMulti = p.operations.length > 1;
  const canApprove =
    p.updatable &&
    user.approvers.some(
      (ua) =>
        p.policy.approvers.some((a) => a.id === ua.id) &&
        !p.approvals.some((a) => a.approver.id === ua.id),
    );

  const supporting = match(p)
    .returnType<ListItemProps['supporting']>()
    .with({ status: 'Pending' }, () =>
      canApprove
        ? ({ Text }) => <Text style={styles.pending}>Approval required</Text>
        : 'Awaiting approval',
    )
    .with(
      { status: 'Scheduled' },
      (p) =>
        ({ Text }) =>
          p.result?.__typename === 'Scheduled' && (
            <Text style={styles.scheduled}>
              Scheduled for <Timestamp timestamp={p.result.scheduledFor} time />
            </Text>
          ),
    )
    .with({ status: 'Executing' }, () => 'Executing...')
    .with({ status: 'Successful' }, () => p.result && <Timestamp timestamp={p.result.timestamp} />)
    .with(
      { status: 'Failed' },
      () =>
        ({ Text }) =>
          p.result && (
            <Text style={styles.failed}>
              <Timestamp timestamp={p.result.timestamp} />
            </Text>
          ),
    )
    .with({ status: 'Cancelled' }, () => ({ Text }) => (
      <Text style={styles.cancelled}>Cancelled</Text>
    ))
    .exhaustive();

  return (
    <Link href={{ pathname: `/(nav)/transaction/[id]`, params: { id: p.id } }} asChild>
      <ListItem
        leading={
          p.icon ? (
            <Image source={{ uri: p.icon }} style={styles.icon} />
          ) : isMulti ? (
            <ActionIcon style={[styles.icon, styles.multiIcon]} size={ICON_SIZE.medium} />
          ) : (
            <OperationIcon operation={p.operations[0]} chain={p.account.chain} />
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
  multiIcon: {
    color: colors.onSurfaceVariant,
  },
}));

export const TransactionItem = withSuspense(
  TransactionItem_,
  <ListItemSkeleton leading supporting />,
);
