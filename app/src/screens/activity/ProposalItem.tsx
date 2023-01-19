import { ProposalId } from '~/queries/proposal';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useProposalLabel } from '../../components/call/useProposalLabel';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { ActivityTransfers } from './ActivityTransfers';
import { match } from 'ts-pattern';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';

export interface ProposalItemProps {
  proposal: ProposalId;
  onPress?: () => void;
}

export const ProposalItem = withSkeleton(({ proposal: id, onPress }: ProposalItemProps) => {
  const p = useProposal(id);
  const token = useMaybeToken(p.to) ?? ETH;
  const label = useProposalLabel(p);
  const transfers = useProposalTransfers(p);

  return (
    <ListItem
      leading={token.addr}
      headline={label}
      supporting={match(p)
        .with({ state: 'pending', userHasApproved: false }, () => 'Awaiting approval')
        .with({ state: 'pending' }, () => 'Awaiting approval from others')
        .with({ state: 'executed' }, () => <Timestamp timestamp={p.timestamp} weekday />)
        .with({ state: 'failed' }, { state: 'executing' }, ({ state }) => state)
        .exhaustive()}
      trailing={<ActivityTransfers transfers={transfers} />}
      onPress={onPress}
    />
  );
}, <ListItemSkeleton leading supporting />);
