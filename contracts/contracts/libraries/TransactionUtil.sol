// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, PolicyKey, PolicyLib} from '../policy/Policy.sol';
import {Approvals} from '../policy/ApprovalsVerifier.sol';
import {Hook} from '../policy/hooks/Hooks.sol';
import {Cast} from './Cast.sol';
import {TypedData} from './TypedData.sol';
import {PaymasterUtil} from '../paymaster/PaymasterUtil.sol';

struct Tx {
  Operation[] operations;
  uint256 validFrom;
  address paymaster;
  bytes paymasterSignedInput;
}

struct Operation {
  address to;
  uint96 value; /// @dev uint96 (instead of uint128 max) to allow packing
  bytes data;
}

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
library TransactionUtil {
  using Cast for uint256;

  /*//////////////////////////////////////////////////////////////
                                   TX
  //////////////////////////////////////////////////////////////*/

  uint160 private constant ACCOUNT_CONTRACTS_OFFSET = 0x10000; // 2^16, above zkSync's MAX_SYSTEM_CONTRACT_ADDRESS
  address private constant MULTI_OPERATION_ADDRESS = address(ACCOUNT_CONTRACTS_OFFSET + 0x1);

  function asTx(SystemTransaction calldata t) internal pure returns (Tx memory) {
    return
      Tx({
        operations: _operations(t),
        validFrom: _validFrom(t),
        paymaster: t.paymaster.toAddressUnsafe(), // won't truncate
        paymasterSignedInput: PaymasterUtil.signedInput(t.paymasterInput)
      });
  }

  function _operations(SystemTransaction calldata t) private pure returns (Operation[] memory ops) {
    address to = t.to.toAddressUnsafe(); // won't truncate
    if (to == MULTI_OPERATION_ADDRESS) {
      ops = abi.decode(t.data, (Operation[]));
    } else {
      ops = new Operation[](1);
      ops[0] = Operation({to: to, value: t.value.toU96(), data: t.data});
    }
  }

  /*//////////////////////////////////////////////////////////////
                                  HASH
  //////////////////////////////////////////////////////////////*/

  string private constant OP_TYPE = 'Operation(address to,uint256 value,bytes data)';
  string private constant TX_TYPE =
    'Tx(Operation[] operations,uint256 validFrom,address paymaster,bytes paymasterSignedInput)';
  bytes32 private constant OP_TYPE_HASH = keccak256(abi.encodePacked(OP_TYPE));
  bytes32 private constant TX_TYPE_HASH = keccak256(abi.encodePacked(TX_TYPE, OP_TYPE));

  function hash(Tx memory t) internal view returns (bytes32) {
    return TypedData.hashTypedData(keccak256(_encodeTx(t)));
  }

  function _encodeTx(Tx memory t) private pure returns (bytes memory) {
    bytes32[] memory hashedOps = new bytes32[](t.operations.length);
    for (uint256 i = 0; i < t.operations.length; i++) {
      hashedOps[i] = keccak256(_encodeOp(t.operations[i]));
    }

    return
      abi.encode(
        TX_TYPE_HASH,
        keccak256(abi.encodePacked(hashedOps)),
        t.validFrom,
        t.paymaster,
        keccak256(t.paymasterSignedInput)
      );
  }

  function _encodeOp(Operation memory op) private pure returns (bytes memory) {
    return abi.encode(OP_TYPE_HASH, op.to, op.value, keccak256(op.data));
  }

  /*//////////////////////////////////////////////////////////////
                               SIGNATURE
  //////////////////////////////////////////////////////////////*/

  /// @dev estimateGas always calls with a 65 byte signature - https://github.com/zkSync-Community-Hub/zksync-developers/discussions/81#discussioncomment-7861481
  function isGasEstimation(SystemTransaction calldata t) internal pure returns (bool) {
    return t.signature.length == 65;
  }

  function _validFrom(SystemTransaction calldata t) internal pure returns (uint256 validFrom) {
    validFrom = abi.decode(t.signature, (uint32 /* first part of signature */));
  }

  function policy(SystemTransaction calldata t) internal view returns (Policy memory policy_) {
    if (!isGasEstimation(t)) {
      (, policy_) = abi.decode(t.signature, (uint32, Policy));
      PolicyLib.verify(policy_);
    }
  }

  function policyAndApprovals(
    SystemTransaction calldata t
  ) internal pure returns (Policy memory policy_, Approvals memory approvals_) {
    if (!isGasEstimation(t)) {
      (, policy_, approvals_) = abi.decode(t.signature, (uint32, Policy, Approvals));
    }
  }
}
