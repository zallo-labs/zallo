// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {Operation} from '../../libraries/TransactionUtil.sol';
import {PLACEHOLDER_SELF_ADDRESS} from './SelfAddress.sol';

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

  function validateOperations(
    Operation[] memory operations,
    bytes memory configData
  ) internal pure {
    TargetsConfig memory config = abi.decode(configData, (TargetsConfig));

    for (uint256 i; i < operations.length; ++i) {
      validateOperation(operations[i], config);
    }
  }

  function validateOperation(Operation memory op, TargetsConfig memory c) internal pure {
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

  /// @notice Replaces the placeholder self address with the account address
  function replaceSelfAddress(
    bytes memory configData
  ) internal view returns (bytes memory newConfigData) {
    TargetsConfig memory c = abi.decode(configData, (TargetsConfig));

    uint256 len = c.contracts.length;
    for (uint256 i; i < len && c.contracts[i].addr <= PLACEHOLDER_SELF_ADDRESS; ++i) {
      if (c.contracts[i].addr == PLACEHOLDER_SELF_ADDRESS) {
        c.contracts[i].addr = address(this);
        _resortContract(c.contracts, i);
        return abi.encode(c);
      }
    }
  }

  /// @notice Resorts a sorted array with one out of place element
  function _resortContract(
    ContractTarget[] memory contracts,
    uint256 outOfPlaceElement
  ) private pure {
    // Swap the element with the next one (to the right) until it's in the right place
    // `outOfPlaceContract` is address(1) so will always be at the start of the array
    for (
      uint256 i = outOfPlaceElement;
      i < contracts.length - 1 && contracts[i].addr > contracts[i + 1].addr;
      ++i
    ) {
      (contracts[i], contracts[i + 1]) = (contracts[i + 1], contracts[i]);
    }
  }
}
