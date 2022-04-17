// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

import './Types.sol';
import './Safe.sol';

contract SafeFactory {
  function create(bytes32 _salt, Approver[] memory _approvers)
    external
    returns (address)
  {
    Safe safe = new Safe{salt: _salt}(_approvers);

    return address(safe);
  }
}
