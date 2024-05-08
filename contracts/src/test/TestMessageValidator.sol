// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {MessageValidator} from '~/validation/MessageValidator.sol';
import {Policy} from '~/validation/Policy.sol';
import {PolicyManager} from '~/validation/PolicyManager.sol';

contract TestMessageValidator is MessageValidator, PolicyManager {
  function testAddPolicy(Policy calldata policy) external {
    _addPolicy(policy);
  }
}
