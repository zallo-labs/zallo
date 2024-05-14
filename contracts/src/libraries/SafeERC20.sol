// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @notice Variant of OZ's SafeERC20 that returns success rather than reverting
library SafeERC20 {
  function safeTransfer(IERC20 token, address to, uint256 value) internal returns (bool success) {
    return _compatibleCall(token, abi.encodeCall(token.transfer, (to, value)));
  }

  function safeTransferFrom(
    IERC20 token,
    address from,
    address to,
    uint256 value
  ) internal returns (bool success) {
    return _compatibleCall(token, abi.encodeCall(token.transferFrom, (from, to, value)));
  }

  function safeApprove(
    IERC20 token,
    address spender,
    uint256 value
  ) internal returns (bool success) {
    bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

    // Try standard approval, this will work for most tokens and always works if zero
    bool standardSuccess = _compatibleCall(token, approvalCall);
    if (standardSuccess || value == 0) return standardSuccess;

    // Approve failed; token may require setting allowance to zero first (e.g. USDT)
    _compatibleCall(token, abi.encodeCall(token.approve, (spender, 0)));
    return _compatibleCall(token, approvalCall);
  }

  /// @notice Calls token with the provided data with compatability for differing implementations:
  /// It handles In response to calls, ERC20 implementations either:
  /// 1. return bool success, as per the spec
  /// 2. return void, reverting if unsuccessful
  function _compatibleCall(IERC20 token, bytes memory data) private returns (bool) {
    (bool success, bytes memory returndata) = address(token).call(data);

    return
      success &&
      (abi.decode(returndata, (bool)) ||
        (returndata.length == 0 && address(token).code.length > 0));
  }
}
