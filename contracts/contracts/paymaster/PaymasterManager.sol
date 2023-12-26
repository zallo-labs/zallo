// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.8;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract PaymasterManager is Ownable {
  using SafeERC20 for IERC20;

  error FailedToSendEth();

  address private constant ETH = address(0);

  constructor(address owner) Ownable(owner) {}

  function withdraw(address token, uint256 amount) external onlyOwner {
    if (token == ETH) {
      (bool success, ) = payable(msg.sender).call{value: amount}('');
      if (!success) revert FailedToSendEth();
    } else {
      // ERC20
      IERC20(token).safeTransfer(msg.sender, amount);
    }
  }
}
