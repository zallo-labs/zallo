// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {PolicyManager, Policy, PolicyKey} from '../policy/PolicyManager.sol';

contract TestPolicyManager is PolicyManager {
  function testAddPolicy(Policy calldata policy) external {
    this.addPolicy(policy);
  }

  function testRemovePolicy(PolicyKey key) external {
    this.removePolicy(key);
  }

  function getPolicyHash(PolicyKey key) external view returns (bytes32) {
    return _getPolicyHash(key);
  }
}
