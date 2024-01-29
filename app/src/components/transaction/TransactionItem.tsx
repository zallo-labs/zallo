import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { match } from 'ts-pattern';
import { materialCommunityIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from './OperationLabel';
import { ETH_ICON_URI, TokenIcon } from '../token/TokenIcon';
import { ProposalValue } from './ProposalValue';
import { useRouter } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { asUAddress } from 'lib';
import { OperationIcon } from '~/components/transaction/OperationIcon';

const Proposal = gql(/* GraphQL */ `
  fragment TransactionItem_TransactionProposal on TransactionProposal {
    id
    label
    status
    createdAt
    updatable
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
  const router = useRouter();
  const p = useFragment(Proposal, proposalFragment);
  const user = useFragment(User, userFragment);

  const isMulti = p.operations.length > 1;
  const canApprove =
    p.updatable && p.potentialApprovers.find((a) => user.approvers.find((ua) => a.id === ua.id));

  const supporting = match(p)
    .returnType<ListItemProps['supporting']>()
    .with({ status: 'Pending' }, () =>
      canApprove
        ? ({ Text }) => <Text style={styles.approvalRequired}>Approval required</Text>
        : 'Awaiting approval',
    )
    .with({ status: 'Executing' }, () => 'Executing...')
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
    .with(
      { status: 'Successful' },
      () => p.transaction?.receipt && <Timestamp timestamp={p.transaction.receipt.timestamp} />,
    )
    .exhaustive();

  return (
    <ListItem
      leading={(props) =>
        isMulti ? (
          <MultiOperationIcon {...props} size={ICON_SIZE.medium} />
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
      onPress={() => router.push({ pathname: `/(drawer)/transaction/[id]`, params: { id: p.id } })}
      {...itemProps}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  approvalRequired: {
    color: colors.primary,
  },
  noSatisfiablePolicy: {
    color: colors.error,
  },
  failed: {
    color: colors.error,
  },
}));

export const TransactionItem = withSuspense(
  TransactionItem_,
  <ListItemSkeleton leading supporting />,
);
