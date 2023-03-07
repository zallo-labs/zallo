// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {Policy} from '../policy/Policy.sol';
import {PolicyManager} from '../policy/PolicyManager.sol';
import {Verifier} from '../policy/Verifier.sol';

abstract contract ERC1271Validator is IERC1271, PolicyManager, Verifier {
  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;

  function isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) external view returns (bytes4 magicValue) {
    (Policy memory policy, bytes[] memory signatures) = _decodeAndVerifySignature(signature);
    _verifySignaturePolicy(policy, signatures, hash);

    magicValue = EIP1271_SUCCESS;
  }
}
