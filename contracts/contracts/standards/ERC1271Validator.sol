// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {Rule} from '../rule/Rule.sol';
import {RuleManager} from '../rule/RuleManager.sol';
import {RuleVerifier} from '../rule/RuleVerifier.sol';

abstract contract ERC1271Validator is IERC1271, RuleManager, RuleVerifier {
  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;

  function isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) external view returns (bytes4 magicValue) {
    (Rule memory rule, bytes[] memory signatures) = _decodeAndVerifySignature(signature);
    _verifySignatureRule(rule, signatures, hash);

    magicValue = EIP1271_SUCCESS;
  }
}
