import { defaultAbiCoder } from 'ethers/lib/utils';
import { POLICY_ABI, Policy } from './policy';
import { asHex } from './bytes';
import { APPROVALS_ABI, Approval } from './approvals';

export const encodeAccountSignature = (
  proposalNonce: bigint,
  policy: Policy,
  approvals: Approval[],
) =>
  asHex(
    defaultAbiCoder.encode(
      ['uint32', POLICY_ABI.type, APPROVALS_ABI.type],
      [
        proposalNonce,
        POLICY_ABI.asStruct(policy),
        APPROVALS_ABI.asStruct({ approvals, approvers: policy.approvers }),
      ],
    ),
  );
