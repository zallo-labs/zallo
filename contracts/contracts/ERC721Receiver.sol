// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/interfaces/IERC721Receiver.sol';

abstract contract ERC721Receiver is IERC721Receiver {
  bytes4 private constant ERC721_RECEIVED_SUCCESS_MAGIC = IERC721Receiver.onERC721Received.selector;

  /// @inheritdoc IERC721Receiver
  function onERC721Received(
    address /* operator */,
    address /* from */,
    uint256 /* tokenId */,
    bytes calldata /* data */
  ) external pure override returns (bytes4) {
    return ERC721_RECEIVED_SUCCESS_MAGIC;
  }
}
