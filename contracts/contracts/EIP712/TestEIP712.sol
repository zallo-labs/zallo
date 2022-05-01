// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import './EIP712.sol';
import '../Types.sol';

contract TestEIP712 is EIP712 {
  function hashTx(Tx calldata _tx) external returns (bytes32) {
    return _hashTx(_tx);
  }

  function domainSeparator() external returns (bytes32) {
    return _domainSeparator();
  }
}
