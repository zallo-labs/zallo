// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import './UserConfigHelper.sol';
import {MerkleProof} from './utils/MerkleProof.sol';

struct User {
  address addr;
  UserConfig[] configs;
}

library UserHelper {
  using UserConfigHelper for UserConfig;
  using MerkleProof for bytes32[];

  error NoUserConfigs();
  error UserConfigHashesNotAscending();

  function merkleRoot(User calldata user) internal pure returns (bytes32) {
    if (user.configs.length == 0) revert NoUserConfigs();

    bytes32[] memory leaves = new bytes32[](user.configs.length);
    for (uint256 i = 0; i < user.configs.length; ) {
      leaves[i] = user.configs[i].hashCalldata();

      // Leaves need to be sorted asc and unique
      if (i > 0 && leaves[i] < leaves[i - 1]) revert UserConfigHashesNotAscending();

      unchecked {
        ++i;
      }
    }

    return leaves.merkleRoot();
  }
}
