// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

type QuorumKey is uint32;

struct Quorum {
  address[] approvers;
}

struct QuorumDefinition {
  QuorumKey key;
  bytes32 hash;
}

library QuorumHelper {
  function hash(Quorum memory quorum) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(quorum.approvers));
  }
}
