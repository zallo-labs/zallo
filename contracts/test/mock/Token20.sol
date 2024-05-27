// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token20 is ERC20 {
  constructor() ERC20('Token20', 'T20') {}
}
