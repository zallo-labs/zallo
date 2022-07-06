// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol';

import './ISafe.sol';

bytes32 constant DOMAIN_TYPE_HASH = keccak256(
  'EIP712Domain(uint256 chainId,address verifyingContract)'
);

bytes32 constant TX_TYPEHASH = keccak256(
  'Tx(address to,uint256 value,bytes data,bytes8 salt)'
);

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
// Heavily inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
contract EIP712 {
  uint256 private _cachedChainId;
  bytes32 private _cachedDomainSeparator;

  constructor() {
    _build();
  }

  function _getTransactionData(Transaction calldata t)
    internal
    pure
    returns (bytes memory)
  {
    (, bytes memory data) = abi.decode(t.data, (bytes8, bytes));
    return data;
  }

  function _hashTx(Transaction calldata t) internal returns (bytes32) {
    (bytes8 salt, bytes memory data) = abi.decode(t.data, (bytes8, bytes));

    bytes32 dataHash = keccak256(
      abi.encode(
        TX_TYPEHASH,
        t.to,
        t.reserved[1], // value
        keccak256(data),
        salt
      )
    );

    return _typedDataHash(dataHash);
  }

  function _domainSeparator() internal returns (bytes32) {
    // Re-generate the domain separator in case of a chain fork
    // As cachedChainId is 0, which isn't a valid chainId, so this branch will always execute on first run
    if (block.chainid != _cachedChainId) _build();

    return _cachedDomainSeparator;
  }

  function _build() private {
    _cachedChainId = block.chainid;

    _cachedDomainSeparator = keccak256(
      abi.encode(DOMAIN_TYPE_HASH, _cachedChainId, address(this))
    );
  }

  function _typedDataHash(bytes32 structHash) private returns (bytes32) {
    return ECDSA.toTypedDataHash(_domainSeparator(), structHash);
  }
}
