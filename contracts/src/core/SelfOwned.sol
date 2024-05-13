// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

abstract contract SelfOwned {
  error OnlyCallableBySelf();

  modifier onlySelf() {
    if (msg.sender != address(this)) revert OnlyCallableBySelf();
    _;
  }
}
