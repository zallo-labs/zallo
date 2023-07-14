import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { Proposal, useProposal } from '@api/proposal';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { FiatValue } from '../fiat/FiatValue';
import { useTransfersValue } from '../call/useTransfersValue';
import { useOperationLabel } from '../call/useOperationLabel';
import { materialCommunityIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { Hex } from 'lib';

const MultiOperationIcon = materialCommunityIcon('multiplication');

export interface ProposalItemProps extends Partial<ListItemProps> {
  proposal: Hex;
}

export const ProposalItem = withSuspense(({ proposal: hash, ...itemProps }: ProposalItemProps) => {
  const styles = useStyles();
  const p = useProposal(hash);
  const token = useMaybeToken(p.operations[0].to) ?? ETH;

  const isMulti = p.operations.length > 1;
  const opLabel = useOperationLabel(p, p.operations[0]);

  const totalValue = useTransfersValue(
    p.transaction?.receipt?.transferEvents ?? p.simulation?.transfers ?? [],
  );

  const supporting = match<Proposal, ListItemProps['supporting']>(p)
    .with({ state: 'pending', policy: undefined }, () => ({ Text }) => (
      <Text style={styles.noSatisfiablePolicy}>No satisfiable policy</Text>
    ))
    .with({ state: 'pending' }, (proposal) =>
      proposal.policy?.responseRequested
        ? ({ Text }) => <Text style={styles.approvalRequired}>Approval required</Text>
        : 'Awaiting approval',
    )
    .with({ state: 'executing' }, () => 'Executing...')
    .with({ state: 'failed' }, () => ({ Text }) => (
      <Text style={styles.failed}>
        <Timestamp timestamp={p.timestamp} />
      </Text>
    ))
    .with({ state: 'executed' }, () => <Timestamp timestamp={p.timestamp} />)
    .exhaustive();

  return (
    <ListItem
      leading={
        isMulti
          ? (props) => <MultiOperationIcon {...props} size={ICON_SIZE.medium} />
          : token.address
      }
      headline={p.label ?? (isMulti ? `${p.operations.length} operations` : opLabel)}
      supporting={supporting}
      trailing={({ Text }) => (
        <Text variant="labelLarge">
          <FiatValue value={totalValue} hideZero />
        </Text>
      )}
      {...itemProps}
    />
  );
}, <ListItemSkeleton leading supporting />);

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
