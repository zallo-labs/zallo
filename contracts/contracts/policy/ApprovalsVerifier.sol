// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';
import {Policy} from './Policy.sol';
import {Secp256k1} from '../libraries/Secp256k1.sol';
import {ERC1271} from '../libraries/ERC1271.sol';

struct Approvals {
  uint256 approversSigned;
  Secp256k1.Signature[] secp256k1;
  bytes[] erc1271;
}

/// @notice Compact secp256k1 signature (https://eips.ethereum.org/EIPS/eip-2098)
/// @dev Signature mutability isn't an issue since signatures aren't used to protect against replay attacks
struct Secp256k1Signature {
  bytes32 r;
  bytes32 yParityAndS;
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
          if (!Secp256k1.verify(a.secp256k1[sigIndex], hash, approver))
            revert InvalidSignature(approver);
        } else {
          if (!ERC1271.verify(a.erc1271[sigIndex - secp256k1Len], hash, approver))
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
}
