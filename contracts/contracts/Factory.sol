// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import './Safe.sol';

contract Factory {
  error FailedOnDeploy();

  function create(bytes32 _groupId, Approver[] calldata _approvers)
    external
    returns (address addr)
  {
    Safe safe = new Safe(_groupId, _approvers);
    return address(safe);
  }

  // zkSync TODO: re-enable once issue is resolved - https://v2-docs.zksync.io/dev/testnet/known-issues.html#can-not-use-create-create2-opcodes-with-raw-bytecode
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
