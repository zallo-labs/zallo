// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

contract Factory {
  error FailedOnDeploy();

  function create(bytes memory _bytecode, bytes32 _salt)
    external
    returns (address addr)
  {
    assembly {
      addr := create2(0, add(_bytecode, 0x20), mload(_bytecode), _salt)
    }

    if (addr == address(0)) revert FailedOnDeploy();
  }
}
