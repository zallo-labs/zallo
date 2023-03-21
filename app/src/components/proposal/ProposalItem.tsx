import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useProposalLabel } from '../call/useProposalLabel';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { Proposal, ProposalId, useProposal } from '@api/proposal';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { FiatValue } from '../fiat/FiatValue';
import { useTransfersValue } from '../call/useTransfersValue';

export interface ProposalItemProps {
  proposal: ProposalId;
  onPress?: () => void;
}

export const ProposalItem = withSuspense(({ proposal: id, onPress }: ProposalItemProps) => {
  const styles = useStyles();
  const p = useProposal(id);
  const token = useMaybeToken(p.to) ?? ETH;

  const supporting = match<Proposal, ListItemProps['supporting']>(p)
    .with({ requiresUserAction: true }, () => ({ Text }) => (
      <Text style={styles.approvalRequired}>Approval required</Text>
    ))
    .with({ state: 'pending' }, () => 'Pending approval')
    .otherwise((p) => <Timestamp timestamp={p.timestamp} weekday />);

  return (
    <ListItem
      leading={token.addr}
      headline={useProposalLabel(p)}
      supporting={supporting}
      trailing={({ Text }) => (
        <Text variant="labelLarge">
          <FiatValue value={useTransfersValue(useProposalTransfers(p))} />
        </Text>
      )}
      onPress={onPress}
    />
  );
}, <ListItemSkeleton leading supporting />);

const useStyles = makeStyles(({ colors }) => ({
  approvalRequired: {
    color: colors.primary,
  },
}));
