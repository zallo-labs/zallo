// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
/// Inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
abstract contract EIP712 {
  /*//////////////////////////////////////////////////////////////
                                CONSTANTS
  //////////////////////////////////////////////////////////////*/

  bytes32 private constant _DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  uint256 private immutable _CACHED_CHAIN_ID;

  bytes32 private immutable _CACHED_DOMAIN_SEPARATOR;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    _CACHED_CHAIN_ID = block.chainid;
    _CACHED_DOMAIN_SEPARATOR = _buildDomainSeparator();
  }

  /*//////////////////////////////////////////////////////////////
                           TYPED DATA HASHING
  //////////////////////////////////////////////////////////////*/

  function _typedDataHash(bytes32 structHash) internal view returns (bytes32) {
    return ECDSA.toTypedDataHash(_domainSeparator(), structHash);
  }

  function _domainSeparator() internal view returns (bytes32) {
    // Re-generate the domain separator in case of a chain fork
    if (block.chainid == _CACHED_CHAIN_ID) {
      return _CACHED_DOMAIN_SEPARATOR;
    } else {
      return _buildDomainSeparator();
    }
  }

  function _buildDomainSeparator() private view returns (bytes32) {
    return
      keccak256(abi.encode(_DOMAIN_TYPE_HASH, block.chainid, address(this)));
  }
}
