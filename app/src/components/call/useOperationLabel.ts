import { match, P } from 'ts-pattern';
import { Proposal, ProposalOperation } from '@api/proposal';
import { useAddressLabel } from '../address/AddressLabel';
import { usePolicy } from '@api/policy';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';

export const useOperationLabel = (p: Proposal, op: ProposalOperation) => {
  const f = op.function;

  const to = useAddressLabel((f && 'to' in f ? f.to : undefined) ?? op.to);
  const policy = usePolicy(
    f?.__typename === 'AddPolicyOp' || f?.__typename === 'RemovePolicyOp' ? f : undefined,
  );
  const swapFromToken = useMaybeToken(f?.__typename === 'SwapOp' ? f.fromToken : undefined);
  const swapToToken = useMaybeToken(f?.__typename === 'SwapOp' ? f.toToken : undefined);

  return match(f)
    .with({ __typename: 'AddPolicyOp' }, () => `Add policy: ${policy?.name}`)
    .with({ __typename: 'RemovePolicyOp' }, () => `Remove policy: ${policy?.name}`)
    .with({ __typename: 'TransferOp' }, () => `Transfer to ${to}`)
    .with({ __typename: 'TransferFromOp' }, () => `Transfer from ${to}`)
    .with({ __typename: 'TransferApprovalOp' }, () => `Approve transfer to ${to}`)
    .with(
      { __typename: 'SwapOp' },
      (f) =>
        `Swap ${swapFromToken?.name || truncateAddr(f.fromToken)} to ${
          swapToToken?.name || truncateAddr(f.toToken)
        }`,
    )
    .with({ __typename: 'GenericOp' }, (f) => `Call ${f._name} on ${to}`)
    .with(P.nullish, () => (op.value ? `Transfer to ${to}` : `Call ${to}`))
    .exhaustive();
};
