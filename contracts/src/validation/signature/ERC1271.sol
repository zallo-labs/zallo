// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

library ERC1271 {
  bytes32 private constant ERC1271_MAGICVALUE = bytes32(IERC1271.isValidSignature.selector);

  function verify(
    bytes memory signature,
    bytes32 hash,
    address signer
  ) internal view returns (bool success) {
    (bool callSuccess, bytes memory result) = signer.staticcall(
      abi.encodeWithSelector(IERC1271.isValidSignature.selector, hash, signature)
    );

    return (callSuccess &&
      result.length == 32 &&
      abi.decode(result, (bytes32)) == ERC1271_MAGICVALUE);
  }
}
