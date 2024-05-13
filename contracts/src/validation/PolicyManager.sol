// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Policy, PolicyKey, PolicyLib} from './Policy.sol';
import {SelfOwned} from 'src/core/SelfOwned.sol';
import {Hooks, Hook} from 'src/validation/hooks/Hooks.sol';

abstract contract PolicyManager is SelfOwned {
  using PolicyLib for Policy;
  using Hooks for Hook[];

  event PolicyAdded(PolicyKey key, bytes32 hash);
  event PolicyRemoved(PolicyKey key);

  error ThresholdTooHigh(uint256 maxThreshold);

  function addPolicy(Policy calldata policy) external payable onlySelf {
    _addPolicy(policy);
  }

  function _addPolicy(Policy memory policy) internal {
    if (policy.threshold > policy.approvers.length)
      revert ThresholdTooHigh(policy.approvers.length);

    // Validate hooks
    policy.hooks.checkConfigs();

    bytes32 hash = policy.hash();
    PolicyLib.hashes()[policy.key] = hash;

    emit PolicyAdded(policy.key, hash);
  }

  function _initializeWithPolicies(Policy[] memory policies) internal {
    uint256 len = policies.length;
    for (uint256 i; i < len; ++i) {
      policies[i].hooks = policies[i].hooks.replaceSelfAddress();
      _addPolicy(policies[i]);
    }
  }

  function removePolicy(PolicyKey key) external payable onlySelf {
    delete PolicyLib.hashes()[key];
    emit PolicyRemoved(key);
  }

  /// @dev Used for testing
  function _getPolicyHash(PolicyKey key) internal view returns (bytes32) {
    return PolicyLib.hashes()[key];
  }
}
