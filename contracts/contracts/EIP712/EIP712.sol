// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import '../Types.sol';

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
// Heavily inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
contract EIP712 {
  bytes32 constant DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  bytes32 private constant TX_TYPEHASH =
    keccak256('Tx(address to,uint256 value,bytes data,uint256 nonce)');

  uint256 private cachedChainId;
  bytes32 private cachedDomainSeparator;

  constructor() {
    _build();
  }

  function _hashTx(Tx calldata _tx) internal returns (bytes32) {
    bytes32 txHash = keccak256(
      abi.encode(TX_TYPEHASH, _tx.to, _tx.value, keccak256(_tx.data), _tx.nonce)
    );

    return _typedDataHash(txHash);
  }

  function _domainSeparator() internal returns (bytes32) {
    // Re-generate the domain separator in case of a chain fork
    // As cachedChainId is 0, which isn't a valid chainId, so this branch will always execute on first run
    if (block.chainid != cachedChainId) _build();

    return cachedDomainSeparator;
  }

  function _build() private {
    cachedChainId = block.chainid;

    cachedDomainSeparator = keccak256(
      abi.encode(DOMAIN_TYPE_HASH, cachedChainId, address(this))
    );
  }

  function _typedDataHash(bytes32 structHash) private returns (bytes32) {
    return ECDSA.toTypedDataHash(_domainSeparator(), structHash);
  }
}
