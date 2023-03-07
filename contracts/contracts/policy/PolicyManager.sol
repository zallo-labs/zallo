// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Policy, PolicyKey, PolicyLib} from './Policy.sol';
import {SelfOwned} from '../SelfOwned.sol';

abstract contract PolicyManager is SelfOwned {
  using PolicyLib for Policy;

  event PolicyAdded(PolicyKey key, bytes32 hash);
  event PolicyRemoved(PolicyKey key);

  error PolicyDoesNotMatchExpectedHash(bytes32 expectedHash);

  function addPolicy(Policy calldata policy) external payable onlySelf {
    _addPolicy(policy);
  }

  function _addPolicy(Policy calldata policy) internal {
    bytes32 hash = policy.hash();
    _policyHashes()[policy.key] = hash;
    emit PolicyAdded(policy.key, hash);
  }

  function _addPolicies(Policy[] calldata policies) internal {
    uint256 policiesLen = policies.length;
    for (uint256 i; i < policiesLen; ) {
      _addPolicy(policies[i]);

      unchecked {
        ++i;
      }
    }
  }

  function removePolicy(PolicyKey key) external payable onlySelf {
    delete _policyHashes()[key];
    emit PolicyRemoved(key);
  }

  function _decodeAndVerifySignature(
    bytes memory signature
  ) internal view returns (Policy memory policy, bytes[] memory signatures) {
    (policy, signatures) = abi.decode(signature, (Policy, bytes[]));

    bytes32 expectedHash = _policyHashes()[policy.key];
    if (policy.hash() != expectedHash) revert PolicyDoesNotMatchExpectedHash(expectedHash);
  }

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

  function _getPolicyHash(PolicyKey key) internal view returns (bytes32) {
    return _policyHashes()[key];
  }
}
