// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

contract Tester {
  fallback() external payable {}

  receive() external payable {}

  function helloWorld() external pure returns (string memory) {
    return 'Hello World';
  }

  function revertWithMessage() external pure {
    revert('revert message');
  }

  function revertWithoutMessage() external pure {
    revert();
  }
}
