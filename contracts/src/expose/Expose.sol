// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {Tx, Operation} from 'src/execution/Transaction.sol';
import {DelayConfig} from 'src/validation/hooks/DelayHook.sol';
import {OtherMessageConfig} from 'src/validation/hooks/OtherMessageHook.sol';
import {TargetsConfig} from 'src/validation/hooks/TargetHook.sol';
import {TransfersConfig} from 'src/validation/hooks/TransferHook.sol';
import {Approvals} from 'src/validation/Approvals.sol';

/// @notice Contract to expose ABI items to hardhat
abstract contract Expose {
  /* execution */
  function Tx_(Tx memory) external pure virtual;
  function Operation_(Operation memory) external pure virtual;
  function Operations(Operation[] memory) external pure virtual;

  /* validation*/
  // hooks
  function DelayHook(DelayConfig memory) external pure virtual;
  function OtherMessageHook(OtherMessageConfig memory) external pure virtual;
  function TargetHook(TargetsConfig memory) external pure virtual;
  function TransferHook(TransfersConfig memory) external pure virtual;

  function Approvals_(Approvals memory) external pure virtual;
}
