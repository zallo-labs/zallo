// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {SelfOwned} from '../SelfOwned.sol';
import {Policy, PolicyKey} from './Policy.sol';
import {Approvals, ApprovalsVerifier} from './ApprovalsVerifier.sol';
import {Hooks, Hook} from '../policy/hooks/Hooks.sol';

abstract contract PolicyManager is SelfOwned {
  using Hooks for Hook[];

  event PolicyAdded(PolicyKey key, bytes32 hash);
  event PolicyRemoved(PolicyKey key);

  error TooManyApprovers(uint256 max, uint256 nApprovers);
  error ThresholdTooLow(uint8 threshold, uint256 nApprovers);
  error ThresholdTooHigh(uint8 threshold, uint256 nApprovers);
  error PolicyDoesNotMatchExpectedHash(bytes32 actualHash, bytes32 expectedHash);

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

    bytes32 hash = _hashPolicyCalldata(policy);
    _policyHashes()[policy.key] = hash;

    emit PolicyAdded(policy.key, hash);
  }

  function _addPolicies(Policy[] calldata policies) internal {
    uint256 policiesLen = policies.length;
    for (uint256 i; i < policiesLen; ++i) {
      _addPolicy(policies[i]);
    }
  }

  function removePolicy(PolicyKey key) external payable onlySelf {
    delete _policyHashes()[key];
    emit PolicyRemoved(key);
  }

  function _decodeAndVerifySignature(
    bytes memory signature
  ) internal view returns (Policy memory policy, Approvals memory approvals) {
    // proposalNonce is ignored
    (, policy, approvals) = abi.decode(signature, (uint32, Policy, Approvals));

    bytes32 actualHash = _hashPolicy(policy);
    bytes32 expectedHash = _policyHashes()[policy.key];
    if (actualHash != expectedHash) revert PolicyDoesNotMatchExpectedHash(actualHash, expectedHash);
  }

  function _hashPolicy(Policy memory p) private pure returns (bytes32) {
    return keccak256(abi.encode(p));
  }

  function _hashPolicyCalldata(Policy calldata p) private pure returns (bytes32) {
    return keccak256(abi.encode(p));
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _policyHashes()
    private
    pure
    returns (mapping(PolicyKey => bytes32 policyHash) storage s)
  {
    assembly {
      // keccack256('PolicyManager.policyHashes')
      s.slot := 0x68d3b202751d1eafbbbccef4366b90f189c9dbf92607a017c704d21f14314581
    }
  }

  /// @dev This should **only ever be used for testing**
  /// @dev Use _decodeAndVerifySignature()
  function _getPolicyHash(PolicyKey key) internal view returns (bytes32) {
    return _policyHashes()[key];
  }
}
