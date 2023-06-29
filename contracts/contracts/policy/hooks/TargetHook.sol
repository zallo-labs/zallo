// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Operation} from '../../TransactionUtil.sol';

struct TargetsConfig {
  ContractTarget[] contracts; /// @dev unique and sorted by `addr` ascending
  Target defaultTarget;
}

struct ContractTarget {
  address addr;
  Target target;
}

struct Target {
  Function[] functions; /// @dev unique and sorted by `selector` ascending
  bool defaultAllow;
}

struct Function {
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
    for (uint256 i; i < c.contracts.length && op.to <= c.contracts[i].addr; ++i) {
      if (op.to == c.contracts[i].addr) return _validateTarget(op, c.contracts[i].target);
    }

    // Fallback to default
    _validateTarget(op, c.defaultTarget);
  }

  function _validateTarget(Operation memory op, Target memory target) private pure {
    bytes4 selector = bytes4(op.data);

    for (uint256 i; i < target.functions.length && selector <= target.functions[i].selector; ++i) {
      if (selector == target.functions[i].selector) {
        if (target.functions[i].allow) {
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
    TargetsConfig memory config = abi.decode(configData, (TargetsConfig));

    ContractTarget memory c;
    for (uint256 ti; ti < config.contracts.length; ++ti) {
      c = config.contracts[ti];

      if (ti > 0 && c.addr <= config.contracts[ti - 1].addr) revert TargetsConfigInvalid();

      for (uint256 fi = 1; fi < c.target.functions.length; ++fi) {
        if (c.target.functions[fi].selector <= c.target.functions[fi - 1].selector)
          revert TargetsConfigInvalid();
      }
    }
  }
}
