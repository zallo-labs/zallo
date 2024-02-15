// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '../Account.sol';
import {TransactionUtil} from '../libraries/TransactionUtil.sol';

contract TestAccount is Account {
  function testExecuteTransaction(SystemTransaction calldata transaction) external {
    _executeTransaction(transaction);
  }
}
