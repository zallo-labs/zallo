// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
// Heavily inspired by: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/draft-EIP712.sol
contract EIP712 {
    bytes32 constant DOMAIN_TYPE_HASH =
        keccak256("EIP712Domain(uint256 chainId,address verifyingContract)");

    uint256 private cachedChainId;
    bytes32 private cachedDomainSeparator;

    function _domainSeparator() private returns (bytes32) {
        // Re-generate the domain separator in case of a chain fork
        // As cachedChainId is 0, which isn't a valid chainId, so this branch will always execute on first run
        if (block.chainid != cachedChainId) {
            cachedChainId = block.chainid;

            cachedDomainSeparator = keccak256(
                abi.encode(DOMAIN_TYPE_HASH, cachedChainId, this)
            );
        }

        return cachedDomainSeparator;
    }

    function domainSeparator() public view returns (bytes32) {
        // TODO: use cached _domainSeparator()
        return keccak256(abi.encode(DOMAIN_TYPE_HASH, block.chainid, this));
    }
}
