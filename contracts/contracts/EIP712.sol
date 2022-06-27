// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import './ISafe.sol';

bytes32 constant DOMAIN_TYPE_HASH = keccak256(
  'EIP712Domain(uint256 chainId,address verifyingContract)'
);

bytes32 constant OP_TYPEHASH = keccak256(
  'Op(address to,uint256 value,bytes data,uint256 nonce)'
);

bytes32 constant OPS_TYPEHASH = keccak256(
  'Ops(Op[] ops)Op(address to,uint256 value,bytes data,uint256 nonce)'
);

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
// Heavily inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
contract EIP712 {
  uint256 private cachedChainId;
  bytes32 private cachedDomainSeparator;

  constructor() {
    _build();
  }

  function _hashOpStruct(Op calldata _op) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encode(
          OP_TYPEHASH,
          _op.to,
          _op.value,
          keccak256(_op.data),
          _op.nonce
        )
      );
  }

  function _hashTx(Op calldata _op) internal returns (bytes32) {
    return _typedDataHash(_hashOpStruct(_op));
  }

  function _hashTx(Op[] calldata _ops) internal returns (bytes32) {
    bytes32[] memory opHashes = new bytes32[](_ops.length);
    for (uint i = 0; i < _ops.length; i++) {
      opHashes[i] = _hashOpStruct(_ops[i]);
    }

    bytes32 txsStructHash = keccak256(
      abi.encode(OPS_TYPEHASH, keccak256(abi.encodePacked(opHashes)))
    );

    return _typedDataHash(txsStructHash);
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
