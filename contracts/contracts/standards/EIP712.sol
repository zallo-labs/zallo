// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
/// Inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
/// Modifications are made to support proxies
abstract contract EIP712 {
  bytes32 private constant _DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  function _typedDataHash(bytes32 structHash) internal view returns (bytes32) {
    return ECDSA.toTypedDataHash(_domainSeparator(), structHash);
  }

  function _domainSeparator() internal view returns (bytes32) {
    // We're unable to cache the domain separator in an immutable variable as address(this) which changes when called by the proxy
    return keccak256(abi.encode(_DOMAIN_TYPE_HASH, block.chainid, address(this)));
  }
}
