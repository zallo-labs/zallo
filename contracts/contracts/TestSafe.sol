// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import './Safe.sol';
import './Types.sol';

contract TestSafe is Safe {
  constructor(Approver[] memory _approvers) Safe(_approvers) {}

  function hashGroup(Approver[] memory _approvers)
    external
    pure
    returns (bytes32)
  {
    return _hashGroup(_approvers);
  }

  function hashOp(Op calldata _op) external returns (bytes32) {
    return _hashOpTx(_op);
  }

  function hashOps(Op[] calldata _ops) external returns (bytes32) {
    return _hashOpsTx(_ops);
  }

  function domainSeparator() external returns (bytes32) {
    return _domainSeparator();
  }
}
