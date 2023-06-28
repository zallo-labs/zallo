// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';
import {Policy} from './Policy.sol';

struct Approvals {
  uint256 approversSigned;
  Secp256k1Signature[] secp256k1;
  bytes[] erc1271;
}

/// @notice Compact secp256k1 signature (https://eips.ethereum.org/EIPS/eip-2098)
/// @dev Signature mutability isn't an issue since signatures aren't used to protect against replay attacks
struct Secp256k1Signature {
  bytes32 r;
  bytes32 vs;
}

library ApprovalsVerifier {
  error ThresholdNotReached(uint256 threshold, uint256 nSignatures);
  error InvalidSignature(address approver);

  /// @notice Constainted by Approvals.approverSigned - a uint256 of bit-packed bools
  uint256 constant MAX_APPROVERS = 256;

  function verify(
    Approvals memory a,
    bytes32 hash,
    Policy memory p
  ) internal view returns (bool success) {
    uint256 secp256k1Len = a.secp256k1.length;
    uint256 nSignatures = secp256k1Len + a.erc1271.length;
    if (nSignatures < p.threshold) return false;

    uint256 sigIndex;
    uint256 approversLen = p.approvers.length;
    address approver;
    for (uint8 approverIndex; approverIndex < approversLen; ) {
      bool approverSigned = (a.approversSigned >> approverIndex) & 1 == 1;
      if (approverSigned) {
        approver = p.approvers[approverIndex];

        if (sigIndex < secp256k1Len) {
          if (!_verifySecp256k1(hash, approver, a.secp256k1[sigIndex]))
            revert InvalidSignature(approver);
        } else {
          if (!_verifyErc1271(hash, approver, a.erc1271[sigIndex - secp256k1Len]))
            revert InvalidSignature(approver);
        }

        unchecked {
          ++sigIndex;
        }
      }

      unchecked {
        ++approverIndex;
      }
    }

    return true;
  }

  function _verifySecp256k1(
    bytes32 hash,
    address signer,
    Secp256k1Signature memory signature
  ) private pure returns (bool) {
    (address recovered, ECDSA.RecoverError err) = ECDSA.tryRecover(hash, signature.r, signature.vs);

    return (err == ECDSA.RecoverError.NoError && recovered == signer);
  }

  bytes32 private constant ERC1271_MAGICVALUE = bytes32(IERC1271.isValidSignature.selector);

  function _verifyErc1271(
    bytes32 hash,
    address signer,
    bytes memory signature
  ) private view returns (bool) {
    (bool success, bytes memory result) = signer.staticcall(
      abi.encodeWithSelector(IERC1271.isValidSignature.selector, hash, signature)
    );

    return (success && result.length == 32 && abi.decode(result, (bytes32)) == ERC1271_MAGICVALUE);
  }
}
