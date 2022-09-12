// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {MerkleProof} from './utils/MerkleProof.sol';

struct UserConfig {
  address[] approvers;
}

library UserConfigHelper {
  using MerkleProof for bytes32[];

  function isValidProof(
    UserConfig memory config,
    bytes32[] memory proof,
    bytes32 root
  ) internal pure returns (bool) {
    return proof.processProof(hash(config)) == root;
  }

  function hash(UserConfig memory config) internal pure returns (bytes32) {
    return keccak256(abi.encode(config));
  }

  function hashCalldata(UserConfig calldata config)
    internal
    pure
    returns (bytes32)
  {
    return keccak256(abi.encode(config));
  }
}
