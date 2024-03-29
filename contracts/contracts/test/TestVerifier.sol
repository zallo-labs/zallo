// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, PolicyKey} from '../policy/Policy.sol';
import {Hook, Hooks} from '../policy/hooks/Hooks.sol';
import {Approvals, ApprovalsVerifier} from '../policy/ApprovalsVerifier.sol';
import {TransactionUtil, Operation} from '../libraries/TransactionUtil.sol';
import {TargetHook, TargetsConfig} from '../policy/hooks/TargetHook.sol';
import {TransferHook, TransfersConfig} from '../policy/hooks/TransferHook.sol';
import {DelayHook, DelayConfig} from '../policy/hooks/DelayHook.sol';
import {OtherMessageHook, OtherMessageConfig} from '../policy/hooks/OtherMessageHook.sol';
import {Scheduler} from '../libraries/Scheduler.sol';
import {Tx} from '../libraries/TransactionUtil.sol';

contract TestVerifier {
  using TransactionUtil for Transaction;
  using ApprovalsVerifier for Approvals;
  using Hooks for Hook[];

  function transaction(Tx calldata tx) external pure {}

  function validateOperations(Hook[] memory hooks, Operation[] calldata operations) external pure {
    hooks.validateOperations(operations);
  }

  function verifyApprovals(
    Approvals calldata approvals,
    bytes32 hash,
    Policy calldata policy
  ) external view returns (bool success) {
    return approvals.verify(hash, policy);
  }

  /*//////////////////////////////////////////////////////////////
                                 HOOKS
  //////////////////////////////////////////////////////////////*/

  function validateTarget(Operation calldata op, TargetsConfig calldata config) external pure {
    TargetHook.validateOperation(op, config);
  }

  function beforeExecuteTransfer(Operation calldata op, TransfersConfig calldata config) external {
    TransferHook.beforeExecuteOp(op, config);
  }

  function validateOtherMessage(
    bool previouslyHandled,
    OtherMessageConfig calldata config
  ) external pure {
    OtherMessageHook.validateMessage(abi.encode(config), previouslyHandled);
  }

  /*//////////////////////////////////////////////////////////////
                                 DELAY
  //////////////////////////////////////////////////////////////*/

  function beforeExecuteDelay(
    bytes32 proposal,
    DelayConfig calldata config
  ) external returns (bool execute) {
    return DelayHook.beforeExecute(proposal, abi.encode(config));
  }

  function getSchedule(bytes32 proposal) external view returns (uint256 timestamp) {
    return Scheduler.getSchedule(proposal);
  }
}
