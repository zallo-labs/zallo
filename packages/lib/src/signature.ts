import { POLICY_STRUCT_ABI, Policy, encodePolicyStruct } from './policy';
import { APPROVALS_ABI, Approval, encodeApprovalsStruct } from './approvals';
import { parseAbiParameter } from 'abitype';
import { encodeAbiParameters } from 'viem';

const TRANSACTION_SIGNATURE_ABI = [
  parseAbiParameter('uint32 proposalNonce'),
  POLICY_STRUCT_ABI,
  APPROVALS_ABI,
] as const;

export function encodeTransactionSignature(
  proposalNonce: bigint, // FIXME: should be number
  policy: Policy,
  approvals: Approval[],
) {
  return encodeAbiParameters(TRANSACTION_SIGNATURE_ABI, [
    Number(proposalNonce),
    encodePolicyStruct(policy),
    encodeApprovalsStruct({ approvals, approvers: policy.approvers }),
  ]);
}
