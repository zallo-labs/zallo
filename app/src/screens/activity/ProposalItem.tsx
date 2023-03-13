import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useProposalLabel } from '../../components/call/useProposalLabel';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { ActivityTransfers } from './ActivityTransfers';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { ProposalId, useProposal } from '@api/proposal';
import { useAccount, useAccountIds } from '@api/account';

export interface ProposalItemProps {
  proposal: ProposalId;
  onPress?: () => void;
}

export const ProposalItem = withSkeleton(({ proposal: id, onPress }: ProposalItemProps) => {
  const accounts = useAccountIds();
  const p = useProposal(id);
  const account = useAccount(p.account);
  const token = useMaybeToken(p.to) ?? ETH;
  const label = useProposalLabel(p);
  const transfers = useProposalTransfers(p);

  return (
    <ListItem
      leading={token.addr}
      overline={accounts.length > 1 ? account.name : undefined}
      headline={label}
      supporting={<Timestamp timestamp={p.timestamp} weekday />}
      trailing={({ Text }) => <ActivityTransfers transfers={transfers} text={Text} />}
      onPress={onPress}
    />
  );
}, <ListItemSkeleton leading supporting />);
