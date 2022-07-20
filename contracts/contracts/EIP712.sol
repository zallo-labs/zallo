// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol';

import './ISafe.sol';

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
/// inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
contract EIP712 {
  /*//////////////////////////////////////////////////////////////
                                CONSTANTS
  //////////////////////////////////////////////////////////////*/

  bytes32 private constant DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  bytes32 private constant TX_TYPE_HASH =
    keccak256('Tx(address to,uint256 value,bytes data,bytes8 salt)');

  /*//////////////////////////////////////////////////////////////
                                 STORAGE
  //////////////////////////////////////////////////////////////*/

  struct Cache {
    uint256 chainId;
    bytes32 domainSeparator;
  }

  function _cache() private pure returns (Cache storage cache) {
    assembly {
      // keccak256('EIP712.cache')
      cache.slot := 0xf68dba10f18cdfecf8223ec52f26de948874e5e780caea01bb809a6e4c0e4d20
    }
  }

  /*//////////////////////////////////////////////////////////////
                               INITIALIZE
  //////////////////////////////////////////////////////////////*/

  function _initialize() internal {
    _buildCachedDomainSeparator(_cache());
  }

  /*//////////////////////////////////////////////////////////////
                           TYPED DATA HASHING
  //////////////////////////////////////////////////////////////*/

  function _typedDataHash(bytes32 structHash) private returns (bytes32) {
    return ECDSA.toTypedDataHash(_domainSeparator(), structHash);
  }

  function _domainSeparator() internal returns (bytes32) {
    // Re-generate the domain separator in case of a chain fork
    Cache storage cache = _cache();
    if (block.chainid != cache.chainId) _buildCachedDomainSeparator(cache);

    return cache.domainSeparator;
  }

  function _buildCachedDomainSeparator(Cache storage cache) internal {
    cache.chainId = block.chainid;

    cache.domainSeparator = keccak256(
      abi.encode(DOMAIN_TYPE_HASH, block.chainid, address(this))
    );
  }

  /*//////////////////////////////////////////////////////////////
                           TRANSACTION HASHING
  //////////////////////////////////////////////////////////////*/

  function _hashTx(Transaction calldata t) internal returns (bytes32) {
    (bytes8 salt, bytes memory data) = abi.decode(t.data, (bytes8, bytes));

    bytes32 dataHash = keccak256(
      abi.encode(
        TX_TYPE_HASH,
        t.to,
        t.reserved[1], // value
        keccak256(data),
        salt
      )
    );

    return _typedDataHash(dataHash);
  }

  function _getTransactionData(Transaction calldata t)
    internal
    pure
    returns (bytes memory)
  {
    (, bytes memory data) = abi.decode(t.data, (bytes8, bytes));
    return data;
  }
}
