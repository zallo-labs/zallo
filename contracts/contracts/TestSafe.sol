// SPDX-License-Identifier: GPL-3.0-or-later
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

  function hashTx(Tx calldata _tx) external returns (bytes32) {
    return _hashTx(_tx);
  }

  function domainSeparator() external returns (bytes32) {
    return _domainSeparator();
  }
}
