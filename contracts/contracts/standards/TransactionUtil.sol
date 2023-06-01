// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
library TransactionUtil {
  bytes32 private constant DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  bytes32 private constant TX_TYPE_HASH =
    keccak256('Tx(address to,uint256 value,bytes data,uint256 nonce)');

  function hash(Transaction calldata t) internal view returns (bytes32) {
    bytes32 structHash = keccak256(
      abi.encode(TX_TYPE_HASH, t.to, t.value, keccak256(t.data), _proposalNonce(t))
    );

    return keccak256(abi.encodePacked('\x19\x01', _domainSeparator(), structHash));
  }

  function _proposalNonce(Transaction calldata t) private pure returns (uint32) {
    return abi.decode(t.signature, (uint32));
  }

  function _domainSeparator() private view returns (bytes32) {
    // Can't be set immutably as it will be called by a proxy and depends on address(this)
    return keccak256(abi.encode(DOMAIN_TYPE_HASH, block.chainid, address(this)));
  }
}
