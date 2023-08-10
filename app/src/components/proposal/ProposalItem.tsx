import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { materialCommunityIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from '../call/OperationLabel';
import { useCanRespond } from './useCanRespond';
import { useNavigation } from '@react-navigation/native';
import { ETH_ICON_URI, TokenIcon } from '../token/TokenIcon/TokenIcon';
import { ProposalValue } from './ProposalValue';

const Proposal = gql(/* GraphQL */ `
  fragment ProposalItem_TransactionProposal on TransactionProposal {
    id
    hash
    label
    status
    createdAt
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
    ...ProposalValue_TransactionProposal
    ...UseCanRespond_TransactionProposalFragment
  }
`);

const User = gql(/* GraphQL */ `
  fragment ProposalItem_User on User {
    id
    ...UseCanRespond_User
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
    const p = useFragment(Proposal, proposalFragment);
    const user = useFragment(User, userFragment);
    const { navigate } = useNavigation();
    const { canApprove } = useCanRespond({ proposal: p, user });

    const isMulti = p.operations.length > 1;

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
        onPress={() => navigate('Proposal', { proposal: p.hash })}
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
