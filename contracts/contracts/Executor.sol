// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IContractDeployer, INonceHolder, DEPLOYER_SYSTEM_CONTRACT, NONCE_HOLDER_SYSTEM_CONTRACT, BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';
import {Utils as CastUtils} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/Utils.sol';
import {TransactionUtil, Operation} from './TransactionUtil.sol';

abstract contract Executor {
  using CastUtils for uint256;
  using TransactionUtil for Transaction;

  /*//////////////////////////////////////////////////////////////
                             EVENTS / ERRORS
  //////////////////////////////////////////////////////////////*/

  event OperationExecuted(bytes32 txHash, bytes response);
  event OperationsExecuted(bytes32 txHash, bytes[] responses);

  error OperationReverted(uint256 operationIndex, bytes reason);
  error TransactionAlreadyExecuted(bytes32 txHash);

  /*//////////////////////////////////////////////////////////////
                                EXECUTION
  //////////////////////////////////////////////////////////////*/

  /// @dev **Only to be called post validation**
  function _executeTransaction(bytes32 txHash, Transaction calldata t) internal {
    _setExecuted(txHash);

    Operation[] memory operations = t.operations();
    if (operations.length == 1) {
      bytes memory response = _executeOperation(operations[0], 0);

      emit OperationExecuted(txHash, response);
    } else {
      bytes[] memory responses = new bytes[](operations.length);
      for (uint256 i; i < operations.length; ++i) {
        responses[i] = _executeOperation(operations[i], i);
      }

      emit OperationsExecuted(txHash, responses);
    }
  }

  function _executeOperation(Operation memory op, uint256 opIndex) private returns (bytes memory) {
    uint32 gas = gasleft().safeCastToU32() - 2000;

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

  function _setExecuted(bytes32 txHash) private {
    uint256 wordIndex = uint256(txHash) / 256;
    uint256 bitIndex = uint256(txHash) % 256;

    _executedTransactions()[wordIndex] |= (1 << bitIndex);
  }

  function _validateTransactionUnexecuted(bytes32 txHash) internal view {
    uint256 wordIndex = uint256(txHash) / 256;
    uint256 bitIndex = uint256(txHash) % 256;
    uint256 mask = (1 << bitIndex);

    if (_executedTransactions()[wordIndex] & mask == mask)
      revert TransactionAlreadyExecuted(txHash);
  }

  /*//////////////////////////////////////////////////////////////
                                  NONCE
  //////////////////////////////////////////////////////////////*/

  function _incrementNonceIfEquals(Transaction calldata t) internal {
    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()),
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

  // function _ensureNonceUnusedAndUse(Transaction memory t, bytes32 txHash) internal {
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
  //   if (nonceUsed) revert TransactionAlreadyExecuted(txHash, t.nonce);

  //   SystemContractsCaller.systemCallWithPropagatedRevert(
  //     uint32(gasleft()),
  //     address(NONCE_HOLDER_SYSTEM_CONTRACT),
  //     0,
  //     abi.encodeCall(INonceHolder.setValueUnderNonce, (t.nonce, 1))
  //   );
  // }
}
