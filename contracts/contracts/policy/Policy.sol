// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {SelfOwned} from '../SelfOwned.sol';
import {Approvals, ApprovalsVerifier} from './ApprovalsVerifier.sol';
import {Hooks, Hook} from '../policy/hooks/Hooks.sol';

type PolicyKey is uint32;

struct Policy {
  PolicyKey key;
  uint8 threshold; /// @dev Each policy may only have up to 256 approvals; constrained by ApprovalsVerifier.MAX_APPROVALS
  address[] approvers;
  Hook[] hooks;
}

library PolicyLib {
  error PolicyDoesNotMatchExpectedHash(bytes32 actualHash, bytes32 expectedHash);

  function verify(Policy memory policy) internal view {
    bytes32 actualHash = _hashMemory(policy);
    bytes32 expectedHash = hashes()[policy.key];
    if (actualHash != expectedHash) revert PolicyDoesNotMatchExpectedHash(actualHash, expectedHash);
  }

  function _hashMemory(Policy memory p) private pure returns (bytes32) {
    return keccak256(abi.encode(p));
  }

  function hash(Policy calldata p) internal pure returns (bytes32) {
    return keccak256(abi.encode(p));
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function hashes() internal pure returns (mapping(PolicyKey => bytes32 policyHash) storage s) {
    assembly {
      // keccack256('Policy.hashes')
      s.slot := 0x02dd6fa66df9c158ef0a4ac91dfd1b56e357dd9272f44b3635916cd0448b8d01
    }
  }
}
