// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Validator} from 'src/validation/Validator.sol';
import {SystemTransaction, TransactionLib, Tx} from 'src/execution/Transaction.sol';
import {Policy, PolicyLib} from 'src/validation/Policy.sol';
import {Approvals} from 'src/validation/Approvals.sol';
import {Scheduler} from 'src/execution/Scheduler.sol';

contract ValidatorTest is UnitTest {
  using TransactionLib for SystemTransaction;
  using TransactionLib for Tx;

  /*//////////////////////////////////////////////////////////////
                    VALIDATE TRANSACTION - STANDARD
  //////////////////////////////////////////////////////////////*/

  function test_validate_Tx_NeverExecuted_Approved_NotSimulated() public {
    Policy memory policy;
    Approvals memory approvals;

    assertTrue(this.validate(_tx(policy, approvals)));
  }

  function test_validate_Tx_NeverExecuted_Approved_FailWhen_Simulated() public {
    SystemTransaction memory systx;
    systx.signature = _simulationSignature();

    assertFalse(this.validate(systx));
  }

  function test_validate_Tx_NeverExecuted_FailWhen_NotApproved() public {
    Policy memory policy;
    policy.threshold = 1;
    Approvals memory approvals;

    assertFalse(this.validate(_tx(policy, approvals)));
  }

  function test_validate_Tx_RevertWhen_AlreadyExecuted() public {
    SystemTransaction memory systx;
    Policy memory policy;
    Approvals memory approvals;

    this.validate(_tx(policy, approvals)); // First

    bytes32 hash = this.hashTransaction(systx);
    vm.expectRevert(abi.encodeWithSelector(Validator.AlreadyExecuted.selector, hash));

    this.validate(_tx(policy, approvals)); // Second - reverts
  }

  /*//////////////////////////////////////////////////////////////
                    VALIDATE TRANSACTION - SCHEDULED
  //////////////////////////////////////////////////////////////*/

  function test_validate_Scheduled_IsScheduled() public {
    Tx memory transaction;

    Scheduler.schedule(transaction.hash(), uint64(block.timestamp));
    this.validate(_scheduledTx(transaction));
  }

  function test_validate_Scheduled_RevertWhen_NotScheduled() public {
    Tx memory transaction;

    vm.expectRevert(abi.encodeWithSelector(Scheduler.NotScheduled.selector, transaction.hash()));
    this.validate(_scheduledTx(transaction));
  }

  function test_validate_Scheduled_RevertWhen_AlreadyExecuted() public {
    Tx memory transaction;
    bytes32 hash = transaction.hash();

    Scheduler.schedule(hash, uint64(block.timestamp));
    this.validate(_scheduledTx(transaction));

    vm.expectRevert(abi.encodeWithSelector(Scheduler.AlreadyExecuted.selector, hash));
    this.validate(_scheduledTx(transaction));
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function _simulationSignature() internal pure returns (bytes memory signature) {
    return new bytes(65);
  }

  function hashTransaction(SystemTransaction calldata systx) external view returns (bytes32 hash) {
    return systx.transaction().hash();
  }

  function _tx(
    Policy memory policy,
    Approvals memory approvals
  ) internal returns (SystemTransaction memory systx) {
    uint32 timestamp;
    systx.signature = abi.encode(timestamp, policy, approvals);

    PolicyLib.hashes()[policy.key] = PolicyLib.hash(policy);
  }

  function _scheduledTx(
    Tx memory transaction
  ) internal pure returns (SystemTransaction memory systx) {
    systx.to = TransactionLib.SCHEDULED_TX;
    systx.data = abi.encode(transaction);
  }

  /// @dev Helper to copy systx to calldata
  function validate(SystemTransaction calldata systx) external returns (bool success) {
    return Validator.validateAfterIncrementingNonce(systx);
  }
}
