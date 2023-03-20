import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useProposalLabel } from '../call/useProposalLabel';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { ActivityTransfers } from '../../screens/activity/ActivityTransfers';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { Proposal, ProposalId, useProposal } from '@api/proposal';
import { useAccountIds } from '@api/account';
import { makeStyles } from '@theme/makeStyles';
import { match } from 'ts-pattern';
import { Addr } from '~/components/addr/Addr';

export interface ProposalItemProps {
  proposal: ProposalId;
  onPress?: () => void;
}

export const ProposalItem = withSkeleton(({ proposal: id, onPress }: ProposalItemProps) => {
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
      overline={useAccountIds().length > 1 ? <Addr addr={p.account} /> : undefined}
      headline={useProposalLabel(p)}
      supporting={supporting}
      trailing={({ Text }) => <ActivityTransfers transfers={useProposalTransfers(p)} text={Text} />}
      onPress={onPress}
    />
  );
}, <ListItemSkeleton leading supporting />);

const useStyles = makeStyles(({ colors }) => ({
  approvalRequired: {
    color: colors.primary,
  },
}));
