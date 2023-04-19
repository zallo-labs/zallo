import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useProposalLabel } from '../call/useProposalLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { Proposal, ProposalId, useProposal } from '@api/proposal';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { FiatValue } from '../fiat/FiatValue';
import { useTransfersValue } from '../call/useTransfersValue';

export interface ProposalItemProps extends Partial<ListItemProps> {
  proposal: ProposalId;
}

export const ProposalItem = withSuspense(({ proposal: id, ...itemProps }: ProposalItemProps) => {
  const styles = useStyles();
  const p = useProposal(id);
  const token = useMaybeToken(p.to) ?? ETH;

  const supporting = match<Proposal, ListItemProps['supporting']>(p)
    .with({ requiresUserAction: true }, () => ({ Text }) => (
      <Text style={styles.approvalRequired}>Approval required</Text>
    ))
    .with({ state: 'pending' }, () => 'Pending approval')
    .with({ state: 'executing' }, () => 'Executing...')
    .with({ state: 'failed' }, () => (
      <>
        Failed at <Timestamp timestamp={p.timestamp} />
      </>
    ))
    .with({ state: 'executed' }, () => <Timestamp timestamp={p.timestamp} />)
    .exhaustive();

  return (
    <ListItem
      leading={token.address}
      headline={useProposalLabel(p)}
      supporting={supporting}
      trailing={({ Text }) => (
        <Text variant="labelLarge">
          <FiatValue
            value={useTransfersValue(
              p.transaction?.receipt?.transfers ?? p.simulation?.transfers ?? [],
            )}
            hideZero
          />
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
}));
