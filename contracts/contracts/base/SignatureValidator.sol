// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {ISignatureValidator} from './ISignatureValidator.sol';
import {Policy} from '../policy/Policy.sol';
import {PolicyManager} from '../policy/PolicyManager.sol';
import {Approvals, ApprovalsVerifier} from '../policy/ApprovalsVerifier.sol';

abstract contract SignatureValidator is ISignatureValidator, PolicyManager {
  using ApprovalsVerifier for Approvals;

  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;

  function isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) external view returns (bytes4 magicValue) {
    if (_isValidSignature(hash, signature)) magicValue = EIP1271_SUCCESS;
  }

  function _isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) internal view returns (bool valid) {
    (Policy memory policy, Approvals memory approvals) = _decodeSignature(signature);
    return approvals.verify(hash, policy);
  }
}
