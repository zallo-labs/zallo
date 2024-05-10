// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {Cast} from 'src/libraries/Cast.sol';
import {Operation} from 'src/execution/Transaction.sol';

address constant NATIVE_TOKEN = address(0);

type Budget is uint32;

struct TransfersConfig {
  TransferLimit[] limits; /// @dev unique and sorted by `token` asc
  bool defaultAllow;
  Budget budget;
}

struct TransferLimit {
  address token;
  uint224 amount;
  uint32 duration; /// @notice seconds
}

struct TokenSpending {
  uint224 spent;
  uint32 timestamp; /// @dev Overlfows on 2106/02/07
}

struct TokenTransfer {
  address token;
  uint224 amount;
}

library TransferHook {
  using Cast for uint256;

  error TransferExceedsLimit(address token, uint224 amount, uint224 limit);
  error CombinedTransferNotSupported();
  error TransferLimitsNotAsc();

  function beforeExecute(Operation[] memory operations, bytes memory configData) internal {
    TransfersConfig memory config = abi.decode(configData, (TransfersConfig));

    TokenTransfer[2] memory transfers;
    for (uint256 i; i < operations.length; ++i) {
      transfers = getTransfers(operations[i]);

      beforeExecuteTransfer(transfers[0], config);
      beforeExecuteTransfer(transfers[1], config);
    }
  }

  function beforeExecuteTransfer(TokenTransfer memory transfer, TransfersConfig memory c) internal {
    if (transfer.amount == 0) return;

    for (uint256 i; i < c.limits.length && c.limits[i].token <= transfer.token; ++i) {
      if (c.limits[i].token == transfer.token)
        return _handleSpend(c.budget, c.limits[i], transfer.amount);
    }

    if (!c.defaultAllow) revert TransferExceedsLimit(transfer.token, transfer.amount, 0);
  }

  function _handleSpend(Budget budget, TransferLimit memory limit, uint224 amount) private {
    TokenSpending storage spending = _spending(budget, limit.token);

    bool inSameEpoch = (block.timestamp / limit.duration) == (spending.timestamp / limit.duration);
    uint224 newSpent = inSameEpoch ? (spending.spent + amount) : amount;
    if (newSpent > limit.amount) revert TransferExceedsLimit(limit.token, amount, limit.amount);

    spending.spent = newSpent;
    if (!inSameEpoch) spending.timestamp = uint32(block.timestamp); // safe truncation
  }

  /// @notice Ensures all invariants are followed
  function checkConfig(bytes memory configData) internal pure {
    TransfersConfig memory c = abi.decode(configData, (TransfersConfig));

    for (uint256 i = 1; i < c.limits.length; ++i) {
      // Check limits: unique and sorted by `token` asc
      if (c.limits[i].token <= c.limits[i - 1].token) revert TransferLimitsNotAsc();
    }
  }

  /*//////////////////////////////////////////////////////////////
                                UTILITY
  //////////////////////////////////////////////////////////////*/

  bytes4 private constant ERC20_INCREASE_ALLOWANCE_SELECTOR = 0x39509351; // Not officially part of ERC20, but common due to being part of OZ's ERC20 implementation (< v5)

  function getTransfers(
    Operation memory op
  ) internal view returns (TokenTransfer[2] memory transfers) {
    if (op.value != 0) {
      // transfers[0].token = NATIVE_TOKEN; by initialization
      transfers[0].amount = op.value;
    }

    if (op.data.length < 68) return transfers;

    // All of the ERC20 transfer-related functions have the same data layout i.e. f(address, uint256 amount)
    bytes4 selector = bytes4(op.data);
    if (
      op.data.length == 68 &&
      (selector == IERC20.transfer.selector ||
        selector == IERC20.approve.selector ||
        selector == ERC20_INCREASE_ALLOWANCE_SELECTOR)
    ) {
      bytes memory data = op.data;
      uint256 amount;
      assembly ('memory-safe') {
        amount := mload(add(data, 68)) // op.data[36:68]
      }

      transfers[1].token = op.to;
      transfers[1].amount = amount.toU224();
    } else if (op.data.length == 100 && selector == IERC20.transferFrom.selector) {
      bytes memory data = op.data;
      address to;
      uint256 amount;
      assembly ('memory-safe') {
        to := mload(add(data, 68)) // op.data[36:68]
        amount := mload(add(data, 100)) // op.data[68:100]
      }

      // Only count transfers to another address
      // Transferring to the account is receiving
      if (to != address(this)) {
        transfers[1].token = op.to;
        transfers[1].amount = amount.toU224();
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _spending(Budget budget, address token) internal view returns (TokenSpending storage s) {
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
