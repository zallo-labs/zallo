// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

uint256 constant SLOT = 256;
uint256 constant HEADER = 32;
uint256 constant HEADER_OFFSET = SLOT - HEADER;

/// @notice Dynamic array of booleans
/// Maximum length of ~4e9 (2^32 - 1)
/// @dev Layout:
/// [ Header (# of bools) | bool 0 | ... | bool 223 ]
/// [ bool 224 | .................................. ]
library BoolArray {
  function length(uint256[] memory bools) internal pure returns (uint256) {
    if (bools.length == 0) return 0;

    return bools[0] >> HEADER_OFFSET;
  }

  function atIndex(uint256[] memory bools, uint256 index) internal pure returns (bool) {
    uint256 i = index + HEADER;
    uint256 shift = SLOT - (i % SLOT) - 1;

    return (bools[i / SLOT] >> shift) & 1 == 1;
  }
}
