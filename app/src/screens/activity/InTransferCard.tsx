import { Id } from 'lib';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Suspend } from '~/components/Suspender';
import { useTransfer } from '~/queries/transfer/useTransfer.sub';
import { ActivityCard } from './ActivityCard';

export interface InTransferCardProps {
  id: Id;
}

export const InTransferCard = withSkeleton(({ id }: InTransferCardProps) => {
  const [transfer] = useTransfer(id);

  if (!transfer) return <Suspend />;

  return (
    <ActivityCard
      token={transfer.token}
      addr={transfer.from}
      label="Receive"
      transfers={[transfer]}
    />
  );
}, CardItemSkeleton);
