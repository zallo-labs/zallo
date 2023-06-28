// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Operation} from '../../TransactionUtil.sol';

struct TargetsConfig {
  ContractTarget[] targets; /// @dev sorted by `to` ascending
  Target defaultTarget;
}

struct ContractTarget {
  address targetAddress;
  Target target;
}

struct Target {
  SelectorTarget[] selectors; /// @dev sorted by `selector` ascending
  bool defaultAllow;
}

struct SelectorTarget {
  bytes4 selector;
  bool allow;
}

library TargetHook {
  error TargetDenied(address to, bytes4 selector);
  error TargetsConfigInvalid();

  function validate(Operation[] memory operations, bytes memory configData) internal pure {
    TargetsConfig memory config = abi.decode(configData, (TargetsConfig));

    for (uint256 i; i < operations.length; ++i) {
      validateOp(operations[i], config);
    }
  }

  function validateOp(Operation memory op, TargetsConfig memory c) internal pure {
    for (uint256 i; i < c.targets.length && op.to <= c.targets[i].targetAddress; ++i) {
      if (op.to == c.targets[i].targetAddress) return _validateTarget(op, c.targets[i].target);
    }

    // Fallback to default
    _validateTarget(op, c.defaultTarget);
  }

  function _validateTarget(Operation memory op, Target memory target) private pure {
    bytes4 selector = bytes4(op.data);

    for (uint256 i; i < target.selectors.length && selector <= target.selectors[i].selector; ++i) {
      if (selector == target.selectors[i].selector) {
        if (target.selectors[i].allow) {
          return;
        } else {
          revert TargetDenied(op.to, selector);
        }
      }
    }

    // Fallback to default
    if (!target.defaultAllow) revert TargetDenied(op.to, selector);
  }

  /// @notice Ensures all invariants are followed
  function checkConfig(bytes memory configData) internal pure {
    TargetsConfig memory c = abi.decode(configData, (TargetsConfig));

    for (uint256 targetIndex; targetIndex < c.targets.length; ++targetIndex) {
      ContractTarget memory t = c.targets[targetIndex];

      if (targetIndex > 0 && t.targetAddress <= c.targets[targetIndex - 1].targetAddress)
        revert TargetsConfigInvalid();

      for (uint256 selectorIndex = 1; selectorIndex < t.target.selectors.length; ++selectorIndex) {
        if (
          t.target.selectors[selectorIndex].selector <=
          t.target.selectors[selectorIndex - 1].selector
        ) revert TargetsConfigInvalid();
      }
    }
  }
}
