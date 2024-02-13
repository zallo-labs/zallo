import { POLICY_STRUCT_ABI, Policy, encodePolicyStruct } from './policy';
import { APPROVALS_ABI, Approval, encodeApprovalsStruct } from './approvals';
import { parseAbiParameter } from 'abitype';
import { encodeAbiParameters } from 'viem';
import { Tx } from './tx';

const TRANSACTION_SIGNATURE_ABI = [
  parseAbiParameter('uint32 proposalNonce'),
  POLICY_STRUCT_ABI,
  APPROVALS_ABI,
] as const;

export interface EncodeTransactionSignature {
  tx: Tx;
  policy: Policy;
  approvals: Approval[];
}

export function encodeTransactionSignature({ tx, policy, approvals }: EncodeTransactionSignature) {
  return encodeAbiParameters(TRANSACTION_SIGNATURE_ABI, [
    Number(tx.nonce),
    encodePolicyStruct(policy),
    encodeApprovalsStruct({ approvals, approvers: policy.approvers }),
  ]);
}
