// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {SafeERC20} from 'src/libraries/SafeERC20.sol';

interface PaymasterFlows {
  function general(bytes calldata input) external;

  function approvalBased(
    address token,
    uint256 minAllowance,
    bytes calldata arbitraryInput
  ) external;

  function approvalBasedWithMax(address token, uint256 amount, uint256 maxAmount) external;
}

library PaymasterFlow {
  using SafeERC20 for IERC20;

  error FeeAmountAboveMax(uint256 amount, uint256 maxAmount);
  error InsufficientFundsForPaymaster(address token, uint256 amount);

  address private constant NATIVE_TOKEN = address(0);

  function payPaymaster(SystemTransaction calldata systx) internal {
    bytes calldata input = systx.paymasterInput;
    if (input.length < 4) return;

    bytes4 selector = bytes4(input[0:4]);
    if (selector == PaymasterFlows.approvalBasedWithMax.selector) {
      (address token, uint256 amount, uint256 maxAmount) = abi.decode(
        input[4:100],
        (address, uint256, uint256)
      );
      if (amount > maxAmount) revert FeeAmountAboveMax(amount, maxAmount);

      _approve(_paymaster(systx), token, amount);
    } else if (selector == PaymasterFlows.approvalBased.selector) {
      (address token, uint256 amount) = abi.decode(input[4:68], (address, uint256));
      _approve(_paymaster(systx), token, amount);
    }
  }

  function signedPaymasterInput(
    SystemTransaction calldata systx
  ) internal pure returns (bytes memory) {
    bytes calldata input = systx.paymasterInput;
    if (input.length < 4 || bytes4(input[0:4]) != PaymasterFlows.approvalBasedWithMax.selector)
      return input;

    address token = address(bytes20(input[16:36]));
    uint256 maxAmount = uint256(bytes32(input[68:100]));

    return abi.encode(token, maxAmount);
  }

  function _approve(address paymaster, address token, uint256 amount) private {
    if (amount == 0) return;

    bool success;
    if (token == NATIVE_TOKEN) {
      (success, ) = paymaster.call{value: amount}('');
    } else {
      if (amount <= IERC20(token).allowance(address(this), paymaster)) return;

      success = IERC20(token).safeApprove(paymaster, amount);
    }

    if (!success) revert InsufficientFundsForPaymaster(token, amount);
  }

  function _paymaster(SystemTransaction calldata systx) private pure returns (address) {
    return address(uint160(systx.paymaster));
  }
}
