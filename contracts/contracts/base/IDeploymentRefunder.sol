// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

struct DeploymentRefundMessage {
    address token;
    uint256 maxAmount;
  }

interface IDeploymentRefunder {
  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error InvalidSignature();
  error AboveMaxRefundAmount();
  error AlreadyRefunded();
  error NotRecipient();
  error FailedToRefundDeployment();

  /*//////////////////////////////////////////////////////////////
                                 REFUND
  //////////////////////////////////////////////////////////////*/

  /// @param message Message; signed by the account
  /// @param signature Signed of the message; signed by the account
  /// @param amount Amount to refund (<= maxAmount); specified by the factory
  function refundDeployment(
    DeploymentRefundMessage calldata message,
    bytes calldata signature,
    uint256 amount
  ) external;
}
