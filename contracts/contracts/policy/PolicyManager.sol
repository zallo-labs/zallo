// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {SelfOwned} from '../SelfOwned.sol';
import {Policy, PolicyKey, PolicyLib} from './Policy.sol';
import {Approvals, ApprovalsVerifier} from './ApprovalsVerifier.sol';
import {Hooks, Hook} from '../policy/hooks/Hooks.sol';

abstract contract PolicyManager is SelfOwned {
  using PolicyLib for Policy;
  using Hooks for Hook[];

  event PolicyAdded(PolicyKey key, bytes32 hash);
  event PolicyRemoved(PolicyKey key);

  error TooManyApprovers(uint256 max, uint256 nApprovers);
  error ThresholdTooLow(uint8 threshold, uint256 nApprovers);
  error ThresholdTooHigh(uint8 threshold, uint256 nApprovers);

  function addPolicy(Policy calldata policy) external payable onlySelf {
    _addPolicy(policy);
  }

  function _addPolicy(Policy calldata policy) internal {
    // Validate approvers and threshold
    uint256 nApprovers = policy.approvers.length;
    if (nApprovers > ApprovalsVerifier.MAX_APPROVERS)
      revert TooManyApprovers(ApprovalsVerifier.MAX_APPROVERS, nApprovers);

    if (policy.threshold == 0 && nApprovers > 0)
      revert ThresholdTooLow(policy.threshold, nApprovers);

    if (policy.threshold > nApprovers) revert ThresholdTooHigh(policy.threshold, nApprovers);

    // Validate hooks
    policy.hooks.checkConfigs();

    bytes32 hash = policy.hash();
    PolicyLib.hashes()[policy.key] = hash;

    emit PolicyAdded(policy.key, hash);
  }

  function _addPolicies(Policy[] calldata policies) internal {
    uint256 policiesLen = policies.length;
    for (uint256 i; i < policiesLen; ++i) {
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
