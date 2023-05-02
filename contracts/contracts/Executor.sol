// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IContractDeployer, INonceHolder, DEPLOYER_SYSTEM_CONTRACT, NONCE_HOLDER_SYSTEM_CONTRACT, BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';
import {Utils as CastUtils} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/Utils.sol';

abstract contract Executor {
  using CastUtils for uint256;

  /*//////////////////////////////////////////////////////////////
                             EVENTS / ERRORS
  //////////////////////////////////////////////////////////////*/

  event TransactionExecuted(bytes32 txHash, bytes response);

  error TransactionReverted(bytes reason);
  error TransactionAlreadyExecuted(bytes32 txHash, uint256 nonce);

  /*//////////////////////////////////////////////////////////////
                                EXECUTION
  //////////////////////////////////////////////////////////////*/

  /// @dev **Only to be called post validation**
  function _executeTransaction(bytes32 txHash, Transaction calldata t) internal {
    address to = address(uint160(t.to));
    uint32 gas = gasleft().safeCastToU32() - 2000;

    bool success;
    bytes memory response;
    if (to == address(DEPLOYER_SYSTEM_CONTRACT)) {
      (success, response) = SystemContractsCaller.systemCallWithReturndata(
        gas,
        to,
        t.value.safeCastToU128(),
        t.data
      );
    } else {
      (success, response) = to.call{value: t.value, gas: gas}(t.data);
    }

    if (success) {
      emit TransactionExecuted(txHash, response);
    } else {
      revert TransactionReverted(response);
    }
  }

  /*//////////////////////////////////////////////////////////////
                                  NONCE
  //////////////////////////////////////////////////////////////*/

  function _incrementNonceIfEquals(Transaction memory t) internal {
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
