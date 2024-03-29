// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {DEPLOYER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {Cast} from './Cast.sol';
import {TransactionUtil, Tx, Operation} from './TransactionUtil.sol';
import {Hook, Hooks} from '../policy/hooks/Hooks.sol';

library Executor {
  using Cast for uint256;
  using TransactionUtil for Transaction;
  using Hooks for Hook[];

  /*//////////////////////////////////////////////////////////////
                             EVENTS / ERRORS
  //////////////////////////////////////////////////////////////*/

  event OperationExecuted(bytes32 proposal, bytes response);
  event OperationsExecuted(bytes32 proposal, bytes[] responses);

  error OperationReverted(uint256 operationIndex, bytes reason);
  error TransactionAlreadyExecuted(bytes32 proposal);

  /*//////////////////////////////////////////////////////////////
                                EXECUTION
  //////////////////////////////////////////////////////////////*/

  /// @dev **Only to be called post validation**
  function executeOperations(
    bytes32 proposal,
    Operation[] memory operations,
    Hook[] memory hooks
  ) internal {
    bool execute = hooks.beforeExecute(proposal, operations);
    if (!execute) return;

    if (operations.length == 1) {
      bytes memory response = _executeOperation(operations[0], 0);

      emit OperationExecuted(proposal, response);
    } else {
      bytes[] memory responses = new bytes[](operations.length);
      for (uint256 i; i < operations.length; ++i) {
        responses[i] = _executeOperation(operations[i], i);
      }

      emit OperationsExecuted(proposal, responses);
    }
  }

  function _executeOperation(Operation memory op, uint256 opIndex) private returns (bytes memory) {
    uint32 gas = uint32(gasleft()) - 2000; // truncation ok

    (bool success, bytes memory response) = (op.to == address(DEPLOYER_SYSTEM_CONTRACT))
      ? SystemContractsCaller.systemCallWithReturndata(gas, op.to, op.value, op.data)
      : op.to.call{value: op.value, gas: gas}(op.data);

    if (!success) revert OperationReverted(opIndex, response);

    return response;
  }

  /*//////////////////////////////////////////////////////////////
                         EXECUTED TRANSACTIONS
  //////////////////////////////////////////////////////////////*/

  function _executedTransactions() private pure returns (mapping(uint256 => uint256) storage s) {
    assembly {
      // keccack256('Executor.executedTransactions')
      s.slot := 0x471df6250cbf7b0cf3c66793e0bf1c0e5b4836f3a593130285b5e9f28489db7c
    }
  }

  function consume(bytes32 proposal) internal {
    uint256 word = uint256(proposal) / 256;
    uint256 bit = uint256(proposal) % 256;
    uint256 mask = 1 << bit;

    if (_executedTransactions()[word] & mask == mask) revert TransactionAlreadyExecuted(proposal);

    _executedTransactions()[word] |= mask;
  }
}
