// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/interfaces/IERC165.sol';

import './ERC721Receiver.sol';

abstract contract ERC165 is IERC165 {
  function supportsInterface(bytes4 interfaceId)
    external
    pure
    virtual
    returns (bool)
  {
    return
      interfaceId == type(IERC165).interfaceId ||
      interfaceId == type(IERC721Receiver).interfaceId;
  }
}
