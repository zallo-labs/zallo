// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

contract TestUtil {
  event Echo(bytes data);

  fallback() external payable {}

  receive() external payable {}

  function echo(bytes calldata data) external returns (bytes calldata) {
    emit Echo(data);
    return data;
  }

  function revertWithoutReason() external pure {
    revert();
  }

  function revertWithReason() external pure {
    revert('reason');
  }
}
