// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

import {Cast} from 'src/libraries/Cast.sol';
import {Operation} from 'src/execution/TransactionUtil.sol';

struct TransfersConfig {
  TransferLimit[] limits; /// @dev sorted by `token` ascending
  bool defaultAllow;
  Budget budget;
}

struct TransferLimit {
  address token;
  uint224 amount;
  uint32 duration; /// @notice seconds
}

type Budget is uint32;

struct TokenSpending {
  uint224 spent;
  uint32 timestamp; /// @dev Overlfows on 2106/02/07
}

struct TransferDetails {
  address token;
  uint256 amount;
}

library TransferHook {
  using Cast for uint256;

  error TransferExceedsLimit(address token, uint256 amount, uint224 limit);
  error CombinedTransferNotSupported();
  error TransfersConfigInvalid();

  function beforeExecute(Operation[] memory operations, bytes memory configData) internal {
    TransfersConfig memory config = abi.decode(configData, (TransfersConfig));

    for (uint256 i; i < operations.length; ++i) {
      beforeExecuteOp(operations[i], config);
    }
  }

  function beforeExecuteOp(Operation memory op, TransfersConfig memory c) internal {
    TransferDetails memory transfer = _getTransfer(op);
    if (transfer.amount == 0) return;

    for (uint256 i; i < c.limits.length && c.limits[i].token <= op.to; ++i) {
      if (c.limits[i].token == transfer.token)
        return _handleSpend(c.budget, c.limits[i], transfer.amount.toU224());
    }

    if (!c.defaultAllow) revert TransferExceedsLimit(transfer.token, transfer.amount, 0);
  }

  function _handleSpend(Budget budget, TransferLimit memory limit, uint224 amount) private {
    TokenSpending storage spending = _spending(budget, limit.token);

    bool inSameEpoch = (block.timestamp / limit.duration) == (spending.timestamp / limit.duration);
    if (inSameEpoch) {
      spending.spent += amount;
    } else {
      spending.spent = amount;
      spending.timestamp = uint32(block.timestamp); // truncation ok
    }

    if (spending.spent > limit.amount)
      revert TransferExceedsLimit(limit.token, amount, limit.amount);
  }

  /// @notice Ensures all invariants are followed
  function checkConfig(bytes memory configData) internal pure {
    TransfersConfig memory c = abi.decode(configData, (TransfersConfig));

    for (uint256 i = 1; i < c.limits.length; ++i) {
      if (c.limits[i].token <= c.limits[i - 1].token) revert TransfersConfigInvalid();
    }
  }

  /*//////////////////////////////////////////////////////////////
                                UTILITY
  //////////////////////////////////////////////////////////////*/

  bytes4 private constant ERC20_INCREASE_ALLOWANCE_SELECTOR = 0x39509351; // Not officially part of ERC20, but common due to being part of OZ's ERC20 implementation (< v5)

  function _getTransfer(
    Operation memory op
  ) private pure returns (TransferDetails memory transfer) {
    // All of the ERC20 transfer-related functions have the same data layout i.e. f(address, uint256 amount)
    if (
      op.data.length == 68 &&
      (bytes4(op.data) == ERC20.transfer.selector ||
        bytes4(op.data) == ERC20.approve.selector ||
        bytes4(op.data) == ERC20_INCREASE_ALLOWANCE_SELECTOR)
    ) {
      if (op.value != 0) revert CombinedTransferNotSupported();

      bytes memory data = op.data;
      uint256 amount;
      assembly ('memory-safe') {
        amount := mload(add(data, 68)) // op.data[36:68]
      }

      transfer.token = op.to;
      transfer.amount = amount;
    } else {
      // transfer.amount == address(0)
      transfer.amount = op.value;
    }
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _spending(Budget budget, address token) private view returns (TokenSpending storage s) {
    bytes32 key = bytes32(abi.encodePacked(budget, token)); // no truncation (24B)
    return _spendingStorage()[key];
  }

  function _spendingStorage() private pure returns (mapping(bytes32 => TokenSpending) storage s) {
    assembly ('memory-safe') {
      // keccack256('TransferHook.spending')
      s.slot := 0xa95c61bf38dc80453e6eb862bd094d5e38b4cd94622f936a28f2a09f6ce0d0b4
    }
  }
}
