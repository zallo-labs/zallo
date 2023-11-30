import { z } from 'zod';
import { TransactionLayoutParams } from '~/app/(drawer)/transaction/[hash]/_layout';
import { PolicyTab } from '~/components/policy/PolicyTab';
import { useLocalParams } from '~/hooks/useLocalParams';

export const TransactionPolicyTabParams = TransactionLayoutParams;
export type TransactionPolicyTabParams = z.infer<typeof TransactionPolicyTabParams>;

export default function TransactionPolicyTab() {
  const params = useLocalParams(TransactionPolicyTabParams);

  return <PolicyTab hash={params.hash} />;
}
