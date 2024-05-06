// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Hook} from 'src/validation/hooks/Hooks.sol';

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
    bytes32 actualHash = hash(policy);
    bytes32 expectedHash = hashes()[policy.key];
    if (actualHash != expectedHash) revert PolicyDoesNotMatchExpectedHash(actualHash, expectedHash);
  }

  function hash(Policy memory p) internal pure returns (bytes32) {
    return keccak256(abi.encode(p));
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function hashes() internal pure returns (mapping(PolicyKey => bytes32 policyHash) storage s) {
    assembly ('memory-safe') {
      // keccack256('Policy.hashes')
      s.slot := 0x02dd6fa66df9c158ef0a4ac91dfd1b56e357dd9272f44b3635916cd0448b8d01
    }
  }
}
