// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {SafeERC20} from 'src/libraries/SafeERC20.sol';

abstract contract Withdrawable is Ownable {
  using SafeERC20 for IERC20;

  error WithdrawingToZeroAddress();
  error WithdrawlFailed();

  address private constant NATIVE_TOKEN = address(0);

  constructor(address owner) Ownable(owner) {}

  function withdraw(address to, address token, uint256 amount) external onlyOwner {
    if (to == address(0)) revert WithdrawingToZeroAddress();

    bool success;
    if (token == NATIVE_TOKEN) {
      (success, ) = payable(to).call{value: amount}('');
    } else {
      success = IERC20(token).safeTransfer(to, amount);
    }
    if (!success) revert WithdrawlFailed();
  }
}
