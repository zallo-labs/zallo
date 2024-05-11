// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Hook, Hooks} from 'src/validation/hooks/Hooks.sol';
import {Policy} from 'src/validation/Policy.sol';
import {Approvals, ApprovalsLib} from 'src/validation/Approvals.sol';
import {TargetHook, TargetsConfig} from 'src/validation/hooks/TargetHook.sol';
import {TransferHook, TransfersConfig, TokenTransfer} from 'src/validation/hooks/TransferHook.sol';
import {DelayHook, DelayConfig} from 'src/validation/hooks/DelayHook.sol';
import {OtherMessageHook, OtherMessageConfig} from 'src/validation/hooks/OtherMessageHook.sol';
import {Tx, Operation} from 'src/execution/Transaction.sol';
import {Scheduler} from 'src/execution/Scheduler.sol';

contract TestVerifier {
  using ApprovalsLib for Approvals;
  using Hooks for Hook[];

  function transaction(Tx calldata tx_) external pure {}

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

  function beforeExecuteTransfer(
    TokenTransfer memory transfer,
    TransfersConfig calldata config
  ) external {
    TransferHook.beforeExecuteTransfer(transfer, config);
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
    return Scheduler.getSchedule(proposal).timestamp;
  }
}
