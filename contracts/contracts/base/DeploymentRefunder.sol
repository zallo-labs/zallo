// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {IDeploymentRefunder, DeploymentRefundMessage} from './IDeploymentRefunder.sol';
import {TypedData} from '../libraries/TypedData.sol';

abstract contract DeploymentRefunder is IDeploymentRefunder {
  function(bytes32 hash, bytes memory signature) internal view returns (bool) immutable private _isValidSignature;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor(function(bytes32 hash, bytes memory signature) internal view returns (bool) isValidSignature) {
    _isValidSignature = isValidSignature;
  }

  function _initializeDeployRefunder() internal {
    _refund().recipient = tx.origin;
  }

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
  ) external {
    address recipient = _onlyRecipientOnce();
    if (!_isValidSignature(_hashRefund(message), signature)) revert InvalidSignature();
    if (amount > message.maxAmount) revert AboveMaxRefundAmount();

    bool success;
    if (message.token == address(0)) {
      (success, ) = payable(recipient).call{value: amount}('');
    } else {
      success = IERC20(message.token).transfer(recipient, amount);
    }
    if (!success) revert FailedToRefundDeployment();
  }

  function _onlyRecipientOnce() private returns (address recipient) {
    recipient = _refund().recipient;
    _refund().recipient = address(0);
    if (recipient != tx.origin) {
      if (recipient == address(0)) {
        revert AlreadyRefunded();
      } else {
        revert NotRecipient();
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MESSAGE
  //////////////////////////////////////////////////////////////*/

  bytes32 private constant DEPLOYMENT_REFUND_TYPE_HASH =
    keccak256('DeploymentRefund(address token,uint256 maxAmount)');

  /// @dev `internal` for testing purposes
  function _hashRefund(DeploymentRefundMessage calldata message) internal view returns (bytes32) {
    bytes32 structHash = keccak256(
      abi.encode(DEPLOYMENT_REFUND_TYPE_HASH, message.token, message.maxAmount)
    );
    return TypedData.hashTypedData(structHash);
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  struct Refund {
    address recipient;
  }

  function _refund() private pure returns (Refund storage s) {
    assembly {
      // keccack256('DeploymentRefunder.refund')
      s.slot := 0x749316ceb260a9b5cf4c04597e6380c7625e26ec4ba4693577817640bae14636
    }
  }
}
