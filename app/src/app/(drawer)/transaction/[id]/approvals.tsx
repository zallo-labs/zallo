import { TransactionLayoutParams } from '~/app/(drawer)/transaction/[id]/_layout';
import { ProposalApprovals } from '~/components/policy/ProposalApprovals';
import { useLocalParams } from '~/hooks/useLocalParams';

export const TransactionApprovalsTabParams = TransactionLayoutParams;

export default function TransactionApprovalsTab() {
  const params = useLocalParams(TransactionApprovalsTabParams);

  return <ProposalApprovals proposal={params.id} />;
}
