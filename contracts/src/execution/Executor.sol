// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {DEPLOYER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {TransactionLib, SystemTransaction, Tx, Operation, TxType} from './Transaction.sol';
import {Scheduler} from './Scheduler.sol';
import {Hook, Hooks} from 'src/validation/hooks/Hooks.sol';

library Executor {
  using TransactionLib for Tx;
  using TransactionLib for SystemTransaction;
  using Hooks for Hook[];

  error UnexpectedTransactionType(TxType txType);

  /*//////////////////////////////////////////////////////////////
                         TRANSACTION EXECUTION
  //////////////////////////////////////////////////////////////*/

  /// @dev Called only after validation
  function execute(SystemTransaction calldata systx) internal {
    TxType txType = systx.transactionType();
    if (txType == TxType.Standard) {
      _executeTransaction(systx);
    } else if (txType == TxType.Scheduled) {
      _executeScheduledTransaction(systx);
    } else {
      revert UnexpectedTransactionType(txType);
    }
  }

  // TODO: transaction.hashLoad() instead when cancun is supported
  function _executeTransaction(SystemTransaction calldata systx) private {
    Tx memory transaction = systx.transaction();
    Hook[] memory hooks = systx.unverifiedPolicy().hooks;

    _executeOperations(transaction.hash(), transaction.operations, hooks);
  }

  // TODO: transaction.hashLoad() instead when cancun is supported
  function _executeScheduledTransaction(SystemTransaction calldata systx) private {
    Tx memory transaction = abi.decode(systx.data, (Tx));
    bytes32 proposal = transaction.hash();

    Scheduler.setExecuted(proposal);
    _executeOperations(proposal, transaction.operations, new Hook[](0));
  }

  /*//////////////////////////////////////////////////////////////
                          OPERATION EXECUTION
  //////////////////////////////////////////////////////////////*/

  function _executeOperations(
    bytes32 proposal,
    Operation[] memory operations,
    Hook[] memory hooks
  ) private {
    bool shouldExecute = hooks.beforeExecute(proposal, operations);
    if (!shouldExecute) return;

    for (uint256 i; i < operations.length; ++i) {
      _callWithPropagatedRevert(operations[i]);
    }
  }

  function _callWithPropagatedRevert(Operation memory op) private returns (bytes memory result) {
    uint32 gas = uint32(gasleft()); // safe truncation

    bool success;
    (success, result) = (op.to == address(DEPLOYER_SYSTEM_CONTRACT))
      ? SystemContractsCaller.systemCallWithReturndata(gas, op.to, op.value, op.data)
      : op.to.call{value: op.value, gas: gas}(op.data);

    if (!success) {
      // Propagate revert
      assembly {
        let size := mload(result)
        revert(add(result, 0x20), size)
      }
    }
  }
}
