// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import './Safe.sol';
import './Types.sol';

contract TestSafe is Safe {
  constructor(Approver[] memory _approvers)
    Safe(bytes32(uint256(1)), getApprovers())
  {}

  function hashApprovers(Approver[] memory _approvers)
    external
    pure
    returns (bytes32)
  {
    return _hashApprovers(_approvers);
  }

  function hashTx(Op calldata _op) external returns (bytes32) {
    return _hashTx(_op);
  }

  function hashMultiTx(Op[] calldata _ops) external returns (bytes32) {
    return _hashTx(_ops);
  }

  function domainSeparator() external returns (bytes32) {
    return _domainSeparator();
  }

  function getApprovers() private pure returns (Approver[] memory approvers) {
    approvers = new Approver[](1);

    approvers[0] = Approver({
      addr: address(0x0000000000000000000000000000000000000001),
      weight: uint96(int96(THRESHOLD))
    });
  }
}
