// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol';

import './EIP712.sol';

abstract contract TransactionExecutor is EIP712 {
  /*//////////////////////////////////////////////////////////////
                                CONSTANTS
  //////////////////////////////////////////////////////////////*/

  bytes32 private constant _TX_TYPE_HASH =
    keccak256('Tx(address to,uint256 value,bytes data,bytes8 salt)');

  /*//////////////////////////////////////////////////////////////
                             EVENTS / ERRORS
  //////////////////////////////////////////////////////////////*/

  event TxExecuted(bytes32 txHash, bytes response);
  event TxReverted(bytes32 txHash, bytes response);

  /*//////////////////////////////////////////////////////////////
                                EXECUTION
  //////////////////////////////////////////////////////////////*/

  function _executeTransaction(bytes32 txHash, Transaction calldata t) internal {
    _setExecuted(txHash);

    address to = address(uint160(t.to));
    (, bytes memory data) = abi.decode(t.data, (bytes8, bytes));

    (bool success, bytes memory response) = to.call{value: t.reserved[1]}(data);

    if (!success) {
      emit TxReverted(txHash, response);

      if (response.length > 0) {
        assembly {
          let returndata_size := mload(response)
          revert(add(32, response), returndata_size)
        }
      } else {
        revert();
      }
    }

    emit TxExecuted(txHash, response);
  }

  function _hashTx(Transaction calldata t) internal view returns (bytes32) {
    (bytes8 salt, bytes memory data) = abi.decode(t.data, (bytes8, bytes));

    bytes32 structHash = keccak256(
      abi.encode(
        _TX_TYPE_HASH,
        t.to,
        t.reserved[1], // value
        keccak256(data),
        salt
      )
    );

    return _typedDataHash(structHash);
  }

  /*//////////////////////////////////////////////////////////////
                                 STORAGE
  //////////////////////////////////////////////////////////////*/

  /// @notice Bit map of executed txs
  function _executedTxs() private pure returns (mapping(uint256 => uint256) storage s) {
    assembly {
      // keccack256('TransactionExecutor.executedTxs')
      s.slot := 0xbc27dde5fff032543400d18687eab3abfc68350f0bf6dbd89802dbc845940024
    }
  }

  /// @param txHash Hash of the transaction
  /// @return True if the transaction has been executed
  function hasBeenExecuted(bytes32 txHash) public view returns (bool) {
    uint256 index = uint256(txHash);
    uint256 wordIndex = index / 256;
    uint256 bitIndex = index % 256;
    uint256 mask = (1 << bitIndex);
    return _executedTxs()[wordIndex] & mask == mask;
  }

  function _setExecuted(bytes32 txHash) internal {
    uint256 index = uint256(txHash);
    uint256 wordIndex = index / 256;
    uint256 bitIndex = index % 256;

    mapping(uint256 => uint256) storage executedTxs = _executedTxs();
    executedTxs[wordIndex] = executedTxs[wordIndex] | (1 << bitIndex);
  }
}
