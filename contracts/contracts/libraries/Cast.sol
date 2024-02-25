// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

library Cast {
  error Uint96CastOverflow(uint256 value);
  error Uint224CastOverflow(uint256 value);

  function toU96(uint256 v) internal pure returns (uint96) {
    if (v > type(uint96).max) revert Uint96CastOverflow(v);
    return uint96(v);
  }

  function toU224(uint256 v) internal pure returns (uint224) {
    if (v > type(uint224).max) revert Uint224CastOverflow(v);
    return uint224(v);
  }

  function toAddressUnsafe(uint256 v) internal pure returns (address) {
    return address(uint160(v));
  }
}
