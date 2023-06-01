import { defaultAbiCoder } from 'ethers/lib/utils';
import { POLICY_ABI, Policy } from './policy';
import { asHex } from './bytes';
import { APPROVALS_ABI, Approval } from './approvals';
import { Tx } from './tx';

export const encodeAccountSignature = (tx: Tx, policy: Policy, approvals: Approval[]) =>
  asHex(
    defaultAbiCoder.encode(
      ['uint32', POLICY_ABI.type, APPROVALS_ABI.type],
      [
        tx.nonce,
        POLICY_ABI.asStruct(policy),
        APPROVALS_ABI.asStruct({ approvals, approvers: policy.approvers }),
      ],
    ),
  );
