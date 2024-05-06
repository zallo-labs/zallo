// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {SignatureValidator} from 'src/validation/SignatureValidator.sol';
import {Policy} from 'src/validation/Policy.sol';
import {PolicyManager} from 'src/validation/PolicyManager.sol';

contract TestSignatureValidator is SignatureValidator, PolicyManager {
  function testAddPolicy(Policy calldata policy) external {
    _addPolicy(policy);
  }
}
