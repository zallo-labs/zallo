// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {SignatureValidator} from '../base/SignatureValidator.sol';
import {Policy, PolicyKey} from '../policy/Policy.sol';
import {PolicyManager} from '../policy/PolicyManager.sol';

contract TestSignatureValidator is SignatureValidator, PolicyManager {
  function testAddPolicy(Policy calldata policy) external {
    _addPolicy(policy);
  }
}
