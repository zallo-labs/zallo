// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {Policy} from '../policy/Policy.sol';
import {PolicyManager} from '../policy/PolicyManager.sol';
import {Approvals, ApprovalsVerifier} from '../policy/ApprovalsVerifier.sol';

abstract contract ERC1271Validator is IERC1271, PolicyManager {
  using ApprovalsVerifier for Approvals;

  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;

  function isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) external view returns (bytes4 magicValue) {
    (Policy memory policy, Approvals memory approvals) = _decodeAndVerifySignature(signature);
    approvals.verify(hash, policy);

    magicValue = EIP1271_SUCCESS;
  }
}
