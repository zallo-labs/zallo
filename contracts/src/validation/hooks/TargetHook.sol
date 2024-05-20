// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {PLACEHOLDER_SELF_ADDRESS} from './SelfAddress.sol';
import {Operation} from 'src/execution/Transaction.sol';

struct TargetsConfig {
  ContractConfig[] contracts; /// @dev unique and sorted by `addr` ascending
  bool defaultAllow;
  bytes4[] defaultExcludedSelectors; /// @dev unique and sorted ascending
}

struct ContractConfig {
  address addr;
  bool allow;
  bytes4[] excludedSelectors; /// @dev unique and sorted ascending
}

library TargetHook {
  error TargetDenied(address to, bytes4 selector);
  error ContractsNotAsc();
  error SelectorsNotAsc();

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
    for (uint256 i; i < c.contracts.length && op.to >= c.contracts[i].addr; ++i) {
      if (op.to == c.contracts[i].addr) {
        return _validateTarget(op, c.contracts[i].allow, c.contracts[i].excludedSelectors);
      }
    }

    // Fallback to default
    _validateTarget(op, c.defaultAllow, c.defaultExcludedSelectors);
  }

  function _validateTarget(
    Operation memory op,
    bool allow,
    bytes4[] memory excludedSelectors
  ) private pure {
    bytes4 selector = bytes4(op.data);

    for (uint256 i; i < excludedSelectors.length && excludedSelectors[i] <= selector; ++i) {
      if (selector != excludedSelectors[i]) continue;

      bool allowExcluded = !allow;
      if (allowExcluded) return;

      revert TargetDenied(op.to, selector);
    }

    // Fallback to default
    if (!allow) revert TargetDenied(op.to, selector);
  }

  /// @notice Ensures all invariants are followed (see config structs)
  function checkConfig(bytes memory configData) internal pure {
    TargetsConfig memory config = abi.decode(configData, (TargetsConfig));

    // Check defaultEcludedSelectors: unique and sorted ascending
    for (uint256 j = 1; j < config.defaultExcludedSelectors.length; ++j) {
      if (config.defaultExcludedSelectors[j] <= config.defaultExcludedSelectors[j - 1])
        revert SelectorsNotAsc();
    }

    ContractConfig memory c;
    for (uint256 i; i < config.contracts.length; ++i) {
      c = config.contracts[i];

      // Check contracts: unique and sorted by `addr` ascending
      if (i > 0 && c.addr <= config.contracts[i - 1].addr) revert ContractsNotAsc();

      // Check contract excludedSelectors: unique and sorted ascending
      for (uint256 j = 1; j < c.excludedSelectors.length; ++j) {
        if (c.excludedSelectors[j] <= c.excludedSelectors[j - 1]) revert SelectorsNotAsc();
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

    return configData;
  }

  /// @notice Resorts a sorted array with one out of place element
  function _resortContract(
    ContractConfig[] memory contracts,
    uint256 outOfPlaceElement
  ) private pure {
    // `outOfPlaceElement` was address(1) and is now the account address so must be moved right (if at all)
    // Swap the element with the next one (to the right) until it's in the right place
    for (
      uint256 i = outOfPlaceElement;
      i < contracts.length - 1 && contracts[i].addr > contracts[i + 1].addr;
      ++i
    ) {
      (contracts[i], contracts[i + 1]) = (contracts[i + 1], contracts[i]);
    }
  }
}
