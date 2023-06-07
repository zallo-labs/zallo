// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Operation} from '../../TransactionUtil.sol';

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
   * @dev Verify that op is matches the specific (or fallback) target.
   * @param targets Targets to verify. Sorted by `to` (ascending).
   * @param op Operation to verify.
   */
  function verify(Operation memory op, Target[] memory targets) internal pure {
    uint256 targetsLen = targets.length;
    if (targets.length == 0) revert NotToAnyOfTargets(op.to, targets);

    uint256 left;
    uint256 right = targetsLen - 1;
    uint256 mid;
    while (left <= right) {
      mid = (left + right) >> 1; // (left + right) / 2

      Target memory target = targets[mid];
      if (target.to == op.to) return _verifySelectorsOrRevert(target.selectors, op.data);

      if (target.to < op.to) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (targets.length > 0 && targets[0].to == FALLBACK_ADDRESS) {
      _verifySelectorsOrRevert(targets[0].selectors, op.data);
    } else {
      revert NotToAnyOfTargets(op.to, targets);
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
