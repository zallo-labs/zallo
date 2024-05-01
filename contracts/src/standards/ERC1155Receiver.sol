// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {IERC1155Receiver} from '@openzeppelin/contracts/interfaces/IERC1155Receiver.sol';

abstract contract ERC1155Reciever is IERC1155Receiver {
  bytes4 private constant ERC1155_RECEIVED_SUCCESS_MAGIC =
    IERC1155Receiver.onERC1155Received.selector;
  bytes4 private constant ERC1155_BATCH_RECEIVED_SUCCESS_MAGIC =
    IERC1155Receiver.onERC1155BatchReceived.selector;

  /// @inheritdoc IERC1155Receiver
  function onERC1155Received(
    address /* operator */,
    address /* from */,
    uint256 /* id */,
    uint256 /* value */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    magic = ERC1155_RECEIVED_SUCCESS_MAGIC;
  }

  /// @inheritdoc IERC1155Receiver
  function onERC1155BatchReceived(
    address /* operator */,
    address /* from */,
    uint256[] calldata /* ids */,
    uint256[] calldata /* values */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    magic = ERC1155_BATCH_RECEIVED_SUCCESS_MAGIC;
  }
}
