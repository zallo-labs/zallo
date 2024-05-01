// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

library TypedData {
  bytes32 private constant DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  function hashTypedData(bytes32 structHash) internal view returns (bytes32) {
    return keccak256(abi.encodePacked('\x19\x01', _domainSeparator(), structHash));
  }

  function _domainSeparator() private view returns (bytes32) {
    // Can't be set immutably as it will be called by a proxy and depends on address(this)
    return keccak256(abi.encode(DOMAIN_TYPE_HASH, block.chainid, address(this)));
  }
}
