// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, PolicyKey} from '../policy/Policy.sol';
import {Hook, Hooks} from '../policy/hooks/Hooks.sol';
import {Approvals, ApprovalsVerifier} from '../policy/ApprovalsVerifier.sol';
import {TransactionUtil, Operation} from '../TransactionUtil.sol';
import {TargetHook, Target} from '../policy/hooks/TargetHook.sol';
import {TransferHook, TransfersConfig} from '../policy/hooks/TransferHook.sol';

contract TestVerifier {
  using TransactionUtil for Transaction;
  using ApprovalsVerifier for Approvals;
  using Hooks for Hook[];

  function validate(Hook[] memory hooks, Operation[] calldata operations) external view {
    hooks.validate(operations);
  }

  function verifyApprovals(
    Approvals calldata approvals,
    bytes32 hash,
    Policy calldata policy
  ) external view {
    approvals.verify(hash, policy);
  }

  /*//////////////////////////////////////////////////////////////
                                 HOOKS
  //////////////////////////////////////////////////////////////*/

  function validateTarget(Operation calldata op, Target[] calldata targets) external pure {
    TargetHook.validateOp(op, targets);
  }

  function beforeExecuteTransfer(Operation calldata op, TransfersConfig calldata config) external {
    TransferHook.beforeExecuteOp(op, config);
  }
}
