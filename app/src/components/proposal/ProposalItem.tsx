import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { FiatValue } from '../fiat/FiatValue';
import { materialCommunityIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from '../call/OperationLabel';
import { useCanRespond } from './useCanRespond';
import { useNavigation } from '@react-navigation/native';
import { ETH_ICON_URI, TokenIcon } from '../token/TokenIcon/TokenIcon';

const Fragment = gql(/* GraphQL */ `
  fragment ProposalItem_TransactionProposalFragment on TransactionProposal {
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
        transferEvents {
          id
          value
        }
      }
    }
    simulation {
      transfers {
        id
        value
      }
    }
    ...UseCanRespond_TransactionProposalFragment
  }
`);

const MultiOperationIcon = materialCommunityIcon('multiplication');

export interface ProposalItemProps extends Partial<ListItemProps> {
  proposal: FragmentType<typeof Fragment>;
}

export const ProposalItem = withSuspense(
  ({ proposal: proposalFragment, ...itemProps }: ProposalItemProps) => {
    const styles = useStyles();
    const p = useFragment(Fragment, proposalFragment);
    const { navigate } = useNavigation();
    const { canApprove } = useCanRespond(p);

    const isMulti = p.operations.length > 1;

    const totalValue = [
      ...(p.transaction?.receipt?.transferEvents ?? p.simulation.transfers),
    ].reduce((sum, t) => sum + (t.value ?? 0), 0);

    const supporting = match(p)
      .returnType<ListItemProps['supporting']>()
      .with({ status: 'Pending' }, () =>
        canApprove
          ? ({ Text }) => <Text style={styles.approvalRequired}>Approval required</Text>
          : 'Awaiting approval',
      )
      .with({ status: 'Executing' }, () => 'Executing...')
      .with({ status: 'Failed' }, () => ({ Text }) => (
        <Text style={styles.failed}>
          <Timestamp timestamp={p.transaction!.receipt!.timestamp} />
        </Text>
      ))
      .with({ status: 'Successful' }, () => (
        <Timestamp timestamp={p.transaction!.receipt!.timestamp} />
      ))
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
            <FiatValue value={totalValue} hideZero />
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
