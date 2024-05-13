// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {MAX_SYSTEM_CONTRACT_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import {UnitTest, console2} from 'test/UnitTest.sol';
import {Executor} from 'src/execution/Executor.sol';
import {SystemTransaction, TransactionLib, Tx, Operation} from 'src/execution/Transaction.sol';
import {Policy, PolicyLib} from 'src/validation/Policy.sol';
import {Approvals} from 'src/validation/Approvals.sol';
import {Scheduler} from 'src/execution/Scheduler.sol';

contract ExecutorTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                     EXECUTE - STANDARD TRANSACTION
  //////////////////////////////////////////////////////////////*/

  function testFuzz_execute_Standard_AllSucceed_Call(Operation[] memory ops) public {
    _assumeValidOps(ops);

    for (uint256 i; i < ops.length; ++i) {
      Operation memory op = ops[i];
      vm.expectCall(op.to, op.value, op.data);
    }

    Tx memory t;
    t.operations = ops;
    this.execute(_tx(t));
  }

  function testFuzz_execute_Standard_RevertWhen_AnyReverts(
    Operation[] memory ops,
    uint8 revertingOpIndex,
    bytes memory revertData
  ) public {
    _assumeValidOps(ops);
    vm.assume(revertingOpIndex < ops.length);

    Operation memory op = ops[revertingOpIndex];
    vm.mockCallRevert(op.to, op.value, op.data, revertData);

    vm.expectRevert(revertData);

    Tx memory t;
    t.operations = ops;
    this.execute(_tx(t));
  }

  /*//////////////////////////////////////////////////////////////
                    EXECUTE - SCHEDULED TRANSACTION
  //////////////////////////////////////////////////////////////*/

  function testFuzz_execute_Scheduled_IsScheduled_AllSucceed_Call(Operation[] memory ops) public {
    _assumeValidOps(ops);

    for (uint256 i; i < ops.length; ++i) {
      Operation memory op = ops[i];
      vm.expectCall(op.to, op.value, op.data);
    }

    Tx memory t;
    t.operations = ops;
    Scheduler.schedule(TransactionLib.hash(t), uint64(block.timestamp));

    this.execute(_scheduledTx(t));
  }

  function testFuzz_execute_Scheduled_IsScheduled_RevertWhen_AnyReverts(
    Operation[] memory ops,
    uint8 revertingOpIndex,
    bytes memory revertData
  ) public {
    _assumeValidOps(ops);
    vm.assume(revertingOpIndex < ops.length);

    Operation memory op = ops[revertingOpIndex];
    vm.mockCallRevert(op.to, op.value, op.data, revertData);

    Tx memory t;
    t.operations = ops;
    Scheduler.schedule(TransactionLib.hash(t), uint64(block.timestamp));

    vm.expectRevert(revertData);

    this.execute(_scheduledTx(t));
  }

  function testFuzz_execute_Scheduled_RevertWhen_NotScheduled(Operation[] memory ops) public {
    _assumeValidOps(ops);

    Tx memory t;
    t.operations = ops;

    vm.expectRevert(
      abi.encodeWithSelector(Scheduler.NotScheduled.selector, TransactionLib.hash(t))
    );

    this.execute(_scheduledTx(t));
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function _assumeValidOps(Operation[] memory ops) internal view {
    vm.assume(ops.length <= 4);

    uint256 total;
    for (uint256 i; i < ops.length; ++i) {
      Operation memory op = ops[i];
      total += op.value;

      vm.assume(op.to > address(MAX_SYSTEM_CONTRACT_ADDRESS));
    }
    vm.assume(total < (address(this).balance - 1 ether));
  }

  function execute(SystemTransaction calldata systx) external {
    return Executor.execute(systx);
  }

  function _tx(Tx memory transaction) internal returns (SystemTransaction memory systx) {
    Policy memory policy;
    Approvals memory approvals;
    return _tx(transaction, policy, approvals);
  }

  function _tx(
    Tx memory transaction,
    Policy memory policy,
    Approvals memory approvals
  ) internal returns (SystemTransaction memory systx) {
    systx.signature = abi.encode(transaction.validFrom, policy, approvals);

    if (transaction.operations.length == 1) {
      systx.to = uint160(transaction.operations[0].to);
      systx.value = transaction.operations[0].value;
      systx.data = transaction.operations[0].data;
    } else {
      systx.to = TransactionLib.MULTI_OP_TX;
      systx.data = abi.encode(transaction.operations);
    }

    PolicyLib.hashes()[policy.key] = PolicyLib.hash(policy);
  }

  function _scheduledTx(Tx memory t) internal pure returns (SystemTransaction memory systx) {
    systx.to = TransactionLib.SCHEDULED_TX;
    systx.data = abi.encode(t);
  }
}
