// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import './Safe.sol';
import './Types.sol';

contract Factory {
  error FailedOnDeploy();

  function create(Approver[] calldata _approvers)
    external
    returns (address addr)
  {
    Safe safe = new Safe(_approvers);
    return address(safe);
  }

  // function create(bytes memory _bytecode, bytes32 _salt)
  //   external
  //   returns (address addr)
  // {
  //   assembly {
  //     // zkSync FIXME: CREATE2 not supported yet )':
  //     // addr := create2(0, add(_bytecode, 0x20), mload(_bytecode), _salt)
  //     addr := create(0, add(_bytecode, 0x20), mload(_bytecode))
  //   }

  //   if (addr == address(0)) revert FailedOnDeploy();
  // }
}
