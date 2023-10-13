import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { materialCommunityIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from './OperationLabel';
import { ETH_ICON_URI, TokenIcon } from '../token/TokenIcon';
import { ProposalValue } from './ProposalValue';
import { useRouter } from 'expo-router';

const Proposal = gql(/* GraphQL */ `
  fragment ProposalItem_TransactionProposal on TransactionProposal {
    id
    hash
    label
    status
    createdAt
    updatable
    operations {
      to
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
  fragment ProposalItem_User on User {
    id
    approvers {
      id
    }
  }
`);

const MultiOperationIcon = materialCommunityIcon('multiplication');

export interface ProposalItemProps extends Partial<ListItemProps> {
  proposal: FragmentType<typeof Proposal>;
  user: FragmentType<typeof User>;
}

export const ProposalItem = withSuspense(
  ({ proposal: proposalFragment, user: userFragment, ...itemProps }: ProposalItemProps) => {
    const styles = useStyles();
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
            <TokenIcon token={p.operations[0].to} fallbackUri={ETH_ICON_URI} {...props} />
          )
        }
        leadingSize="medium"
        headline={
          p.label ??
          (isMulti ? (
            `${p.operations.length} operations`
          ) : (
            <OperationLabel operation={p.operations[0]} />
          ))
        }
        supporting={supporting}
        trailing={({ Text }) => (
          <Text variant="labelLarge">
            <ProposalValue proposal={p} hideZero />
          </Text>
        )}
        onPress={() => router.push({ pathname: `/transaction/[hash]/`, params: { hash: p.hash } })}
        {...itemProps}
      />
    );
  },
  <ListItemSkeleton leading supporting />,
);

const useStyles = makeStyles(({ colors }) => ({
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
