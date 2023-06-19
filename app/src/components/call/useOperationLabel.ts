import { match, P } from 'ts-pattern';
import { Proposal, ProposalOperation } from '@api/proposal';
import { useAddressLabel } from '../address/AddressLabel';
import { usePolicy } from '@api/policy';
import { useToken } from '@token/useToken';
import { useFormattedTokenAmount } from '../token/TokenAmount';

export function useOperationLabel(p: Proposal, op: ProposalOperation) {
  return match(op.function)
    .with({ __typename: 'AddPolicyOp' }, (f) => `Add policy: ${usePolicy(f)?.name}`)
    .with({ __typename: 'RemovePolicyOp' }, (f) => `Remove policy: ${usePolicy(f)?.name}`)
    .with(
      { __typename: 'TransferOp' },
      (f) => `Transfer ${useFormattedTokenAmount(f)} to ${useAddressLabel(f.to)}`,
    )
    .with(
      { __typename: 'TransferFromOp' },
      (f) => `Transfer ${useToken(f.token).name} from ${useAddressLabel(f.from)}`,
    )
    .with(
      { __typename: 'TransferApprovalOp' },
      (f) => `Allow ${useAddressLabel(f.spender)} to spend ${useToken(f.token).name}`,
    )
    .with(
      { __typename: 'SwapOp' },
      (f) => `Swap ${useToken(f.fromToken).name} for ${useToken(f.toToken).name}`,
    )
    .with({ __typename: 'GenericOp' }, (f) => `Call ${f._name} on ${useAddressLabel(op.to)}`)
    .with(P.nullish, () => `Call ${useAddressLabel(op.to)}`)
    .exhaustive();
}
