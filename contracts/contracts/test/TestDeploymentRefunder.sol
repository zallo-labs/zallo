// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {DeploymentRefunder, DeploymentRefundMessage} from '../base/DeploymentRefunder.sol';
import {MockSignatureValidator} from './mocks/MockSignatureValidator.sol';

contract TestDeploymentRefunder is DeploymentRefunder, MockSignatureValidator {
  constructor() DeploymentRefunder(_isValidSignature) {}

  function initializeDeployRefunder() external {
    _initializeDeployRefunder();
  }

  function hashRefund(DeploymentRefundMessage calldata message) external view returns (bytes32) {
    return _hashRefund(message);
  }
}
