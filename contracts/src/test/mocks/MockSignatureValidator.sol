// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

contract MockSignatureValidator is IERC1271 {
  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;

  bool private _validSignature;

  function setValidSignature(bool validSignature) external {
    _validSignature = validSignature;
  }

  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4 magicValue) {
    if (_validSignature) magicValue = EIP1271_SUCCESS;
  }
}
