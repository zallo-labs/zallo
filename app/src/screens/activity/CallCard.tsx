import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Suspend } from '~/components/Suspender';
import { makeStyles } from '~/util/theme/makeStyles';
import { Proposal, ProposalId } from '~/queries/proposal';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { CardProps } from '../../components/card/Card';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { useTx } from '~/queries/tx/tx/useTx';
import { useCallName } from '../../components/call/useCallName';
import { ActivityCard } from './ActivityCard';
import { useTxTransfers } from '~/components/call/useTxTransfers';

export interface CallCardProps extends CardProps {
  id: ProposalId;
}

export const CallCard = withSkeleton(({ id, ...cardProps }: CallCardProps) => {
  const { tx } = useTx(id);
  const styles = useStyles(tx);
  const token = useMaybeToken(tx?.to) ?? ETH;
  const name = useCallName(tx);
  const transfers = useTxTransfers(tx);

  if (!tx) return <Suspend />;

  return (
    <ActivityCard
      token={token}
      addr={tx.to}
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
