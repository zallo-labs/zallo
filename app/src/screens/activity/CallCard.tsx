import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { makeStyles } from '~/util/theme/makeStyles';
import { Proposal, ProposalId } from '~/queries/proposal';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { CardProps } from '../../components/card/Card';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { useCallLabel } from '../../components/call/useCallLabel';
import { ActivityCard } from './ActivityCard';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { useProposal } from '~/queries/proposal/useProposal.api';

export interface CallCardProps extends CardProps {
  id: ProposalId;
}

export const CallCard = withSkeleton(({ id, ...cardProps }: CallCardProps) => {
  const [p] = useProposal(id);
  const styles = useStyles(p);
  const token = useMaybeToken(p?.to) ?? ETH;
  const name = useCallLabel(p);
  const transfers = useProposalTransfers(p);

  return (
    <ActivityCard
      token={token}
      addr={p.to}
      label={name}
      transfers={transfers}
      backgroundColor={styles.card.backgroundColor}
      {...cardProps}
    />
  );
}, CardItemSkeleton);

const useStyles = makeStyles(({ colors }, tx: Proposal) => {
  const backgroundColor = ((): string | undefined => {
    switch (tx?.status) {
      case 'proposed':
        return !tx.userHasApproved
          ? colors.primaryContainer
          : colors.secondaryContainer;
      case 'submitted':
        return colors.secondaryContainer;
      case 'failed':
        return colors.errorContainer;
      case 'executed':
      case undefined:
        return undefined;
      default:
        throw new Error('Unhandled status', tx.status);
    }
  })();

  return {
    card: {
      ...(backgroundColor && { backgroundColor }),
    },
  };
});
