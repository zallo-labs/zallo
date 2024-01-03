import { z } from 'zod';
import { MessageLayoutParams } from '~/app/(drawer)/message/[id]/_layout';
import { ProposalApprovals } from '~/components/policy/ProposalApprovals';
import { useLocalParams } from '~/hooks/useLocalParams';

export const MessagePolicyTabParams = MessageLayoutParams;
export type MessagePolicyTabParams = z.infer<typeof MessagePolicyTabParams>;

export default function MessagePolicyTab() {
  const params = useLocalParams(MessagePolicyTabParams);

  return <ProposalApprovals proposal={params.id} />;
}
