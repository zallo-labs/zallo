// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestToken is ERC20 {
  constructor() ERC20('Test Token', 'TEST') {}

  function testMint(address account, uint256 amount) external {
    _mint(account, amount);
  }
}
