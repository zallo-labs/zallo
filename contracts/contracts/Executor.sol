// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IContractDeployer, INonceHolder, DEPLOYER_SYSTEM_CONTRACT, NONCE_HOLDER_SYSTEM_CONTRACT, BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {Cast} from './libraries/Cast.sol';
import {TransactionUtil, Operation} from './TransactionUtil.sol';
import {Hook, Hooks} from './policy/hooks/Hooks.sol';

abstract contract Executor {
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
  function _executeTransaction(bytes32 proposal, Transaction calldata t) internal {
    _setExecuted(proposal);

    Operation[] memory operations = t.operations();

    t.hooks().beforeExecute(operations);

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

  function _setExecuted(bytes32 proposal) private {
    uint256 wordIndex = uint256(proposal) / 256;
    uint256 bitIndex = uint256(proposal) % 256;

    _executedTransactions()[wordIndex] |= (1 << bitIndex);
  }

  function _validateTransactionUnexecuted(bytes32 proposal) internal view {
    uint256 wordIndex = uint256(proposal) / 256;
    uint256 bitIndex = uint256(proposal) % 256;
    uint256 mask = (1 << bitIndex);

    if (_executedTransactions()[wordIndex] & mask == mask)
      revert TransactionAlreadyExecuted(proposal);
  }

  /*//////////////////////////////////////////////////////////////
                                  NONCE
  //////////////////////////////////////////////////////////////*/

  function _incrementNonceIfEquals(Transaction calldata t) internal {
    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()), // truncation ok
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (t.nonce))
    );
  }

  // function _initializeArbitraryNonceOrdering() internal {
  //   // Use arbitrary nonce ordering
  //   SystemContractsCaller.systemCallWithPropagatedRevert(
  //     uint32(gasleft()),
  //     address(DEPLOYER_SYSTEM_CONTRACT),
  //     0,
  //     abi.encodeCall(
  //       DEPLOYER_SYSTEM_CONTRACT.updateNonceOrdering,
  //       (IContractDeployer.AccountNonceOrdering.Arbitrary)
  //     )
  //   );
  // }

  // function _ensureNonceUnusedAndUse(Transaction memory t, bytes32 proposal) internal {
  //   SystemContractsCaller.systemCallWithPropagatedRevert(
  //     uint32(gasleft()),
  //     address(NONCE_HOLDER_SYSTEM_CONTRACT),
  //     0,
  //     abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (t.nonce))
  //   );

  //   bytes memory response = SystemContractsCaller.systemCallWithPropagatedRevert(
  //     uint32(gasleft()),
  //     address(NONCE_HOLDER_SYSTEM_CONTRACT),
  //     0,
  //     abi.encodeCall(INonceHolder.getValueUnderNonce, (t.nonce))
  //   );

  //   bool nonceUsed = response.length > 0 ? response[0] != 0 : false;
  //   if (nonceUsed) revert TransactionAlreadyExecuted(proposal, t.nonce);

  //   SystemContractsCaller.systemCallWithPropagatedRevert(
  //     uint32(gasleft()),
  //     address(NONCE_HOLDER_SYSTEM_CONTRACT),
  //     0,
  //     abi.encodeCall(INonceHolder.setValueUnderNonce, (t.nonce, 1))
  //   );
  // }
}
