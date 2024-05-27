// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

library Cast {
  error Overflow();

  function toU96(uint256 v) internal pure returns (uint96) {
    if (v > type(uint96).max) revert Overflow();
    return uint96(v);
  }

  function toU224(uint256 v) internal pure returns (uint224) {
    if (v > type(uint224).max) revert Overflow();
    return uint224(v);
  }

  function toAddressUnsafe(uint256 v) internal pure returns (address) {
    return address(uint160(v));
  }
}
