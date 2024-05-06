// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {ERC1967Proxy} from '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol';

import {Account} from './Account.sol';

contract AccountProxy is ERC1967Proxy {
  error NoInitializationDataProvided(bytes data);

  constructor(address logic, bytes memory data) payable ERC1967Proxy(logic, data) {
    if (bytes4(data) != Account.initialize.selector) revert NoInitializationDataProvided(data);
  }
}
