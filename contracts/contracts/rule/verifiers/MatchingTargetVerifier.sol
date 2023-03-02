// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

abstract contract MatchingTargetVerifier {
  error DidNotMatchTarget(address actual, address expected);
  error DidNotMatchAnyTarget(address actual, address[] expectedAnyOf);

  function _verifyMatchingTarget(address target, Transaction memory transaction) public pure {
    address to = address(uint160(transaction.to));
    if (target != to) revert DidNotMatchTarget(to, target);
  }

  function _verifyMatchingAnyTarget(
    address[] memory targets,
    Transaction memory transaction
  ) public pure {
    address to = address(uint160(transaction.to));

    uint256 targetsLen = targets.length;
    for (uint i; i < targetsLen; ) {
      if (targets[i] == to) return;

      unchecked {
        ++i;
      }
    }

    revert DidNotMatchAnyTarget(to, targets);
  }
}
