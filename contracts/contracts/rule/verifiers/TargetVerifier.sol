// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

library TargetVerifier {
  error NotTarget(address actual, address expected);
  error NotAnyOfTargets(address actual, address[] expectedAnyOf);

  function verifyTarget(address target, Transaction memory transaction) internal pure {
    address to = address(uint160(transaction.to));
    if (target != to) revert NotTarget(to, target);
  }

  function verifyAnyOfTargets(
    address[] memory targets,
    Transaction memory transaction
  ) internal pure {
    address to = address(uint160(transaction.to));

    uint256 targetsLen = targets.length;
    for (uint i; i < targetsLen; ) {
      if (targets[i] == to) return;

      unchecked {
        ++i;
      }
    }

    revert NotAnyOfTargets(to, targets);
  }
}
