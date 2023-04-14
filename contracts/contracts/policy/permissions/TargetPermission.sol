// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

struct Target {
  address to;
  bytes4[] selectors; /// @dev Sorted ascending
}

library TargetPermission {
  error NotToAnyOfTargets(address to, Target[] targets);
  error NotAnyOfTargetSelectors(bytes4 selector, bytes4[] targetSelectors);

  address private constant FALLBACK_ADDRESS = address(0);
  bytes4 private constant ANY_SELECTOR = bytes4(0);

  /**
   * @dev Verify that transaction is matches the specific (or fallback) target.
   * @param targets Targets to verify. Sorted by `to` (ascending).
   * @param transaction Transaction to verify.
   */
  function verify(Transaction memory transaction, Target[] memory targets) internal pure {
    address to = address(uint160(transaction.to));

    uint256 targetsLen = targets.length;
    if (targets.length == 0) revert NotToAnyOfTargets(to, targets);

    uint256 left;
    uint256 right = targetsLen - 1;
    uint256 mid;
    while (left <= right) {
      mid = (left + right) >> 1; // (left + right) / 2

      Target memory target = targets[mid];
      if (target.to == to) return _verifySelectorsOrRevert(target.selectors, transaction.data);

      if (target.to < to) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (targets.length > 0 && targets[0].to == FALLBACK_ADDRESS) {
      _verifySelectorsOrRevert(targets[0].selectors, transaction.data);
    } else {
      revert NotToAnyOfTargets(to, targets);
    }
  }

  function _verifySelectorsOrRevert(bytes4[] memory selectors, bytes memory data) private pure {
    if (data.length < 4) return; // Not function call
    bytes4 selector = bytes4(data);

    uint256 selectorsLen = selectors.length;
    if (selectorsLen == 0) revert NotAnyOfTargetSelectors(selector, selectors);
    if (selectorsLen == 1 && selectors[0] == ANY_SELECTOR) return;

    uint256 left;
    uint256 right = selectorsLen - 1;
    uint256 mid;
    while (left <= right) {
      mid = (left + right) >> 1; // (left + right) / 2

      if (selectors[mid] == selector) return;

      if (selectors[mid] < selector) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    revert NotAnyOfTargetSelectors(selector, selectors);
  }
}
