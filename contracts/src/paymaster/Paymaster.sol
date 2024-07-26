// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import {BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {Withdrawable} from './Withdrawable.sol';
import {ImmutablePriceOracle} from './ImmutablePriceOracle.sol';
import {Rate} from './PriceOracle.sol';
import {PaymasterFlows} from './PaymasterFlow.sol';
import {SafeERC20} from 'src/libraries/SafeERC20.sol';

contract Paymaster is IPaymaster, Withdrawable, ImmutablePriceOracle {
  using SafeERC20 for IERC20;

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error OnlyCallableByBootloader();
  error InvalidPaymasterInput();
  error FailedToPayBootloader(uint256 networkFee);
  error RefundFailed(bytes32 txHash, uint256 maxRefundedGas);

  /*//////////////////////////////////////////////////////////////
                               CONSTANTS
  //////////////////////////////////////////////////////////////*/

  uint256 internal constant POST_TRANSACTION_GAS_OFFSET = 2675;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor(
    address owner,
    ImmutablePriceOracle.Config memory oracleConfig
  ) Withdrawable(owner) ImmutablePriceOracle(oracleConfig) {}

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {
    // TODO: replace with transient balance to behave like `msg.value` once cancun is supported
    _balance()[msg.sender] += msg.value;
  }

  /*//////////////////////////////////////////////////////////////
                          TRANSACTION PAYMENT
  //////////////////////////////////////////////////////////////*/

  function validateAndPayForPaymasterTransaction(
    bytes32 /* txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable onlyBootloader returns (bytes4 magic, bytes memory context) {
    if (!_isApprovalBasedWithMaxFlow(systx.paymasterInput)) revert InvalidPaymasterInput();

    (address token, uint256 amount) = abi.decode(systx.paymasterInput[4:68], (address, uint256));
    uint256 networkFee = systx.gasLimit * systx.maxFeePerGas;

    Rate memory nativePerToken = _rate(NATIVE, token);
    uint256 minAmount = _convertUp(networkFee, nativePerToken);
    // paymasterFee = amount - minAmount;

    address from = address(uint160(systx.from));
    if (amount >= minAmount && _transferFrom(from, token, amount)) {
      magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
    }

    // Pay bootloader
    (bool bootloaderPaid, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: networkFee}('');
    if (!bootloaderPaid) revert FailedToPayBootloader(networkFee);

    context = abi.encode(nativePerToken);
  }

  /// @dev Bootloader refunds paymaster: `maxRefundedGas` - gas used during `postTransaction()`
  function postTransaction(
    bytes calldata context,
    SystemTransaction calldata systx,
    bytes32 txHash,
    bytes32 /* suggestedSignedHash */,
    ExecutionResult /* txResult */,
    uint256 maxRefundedGas
  ) external payable onlyBootloader {
    if (maxRefundedGas <= POST_TRANSACTION_GAS_OFFSET) return;

    Rate memory nativePerToken = abi.decode(context, (Rate));
    uint256 nativeRefund = systx.maxFeePerGas * (maxRefundedGas - POST_TRANSACTION_GAS_OFFSET);
    uint256 tokenRefund = _convertDown(nativeRefund, nativePerToken);

    bool refunded = _transfer(nativePerToken.quote, address(uint160(systx.from)), tokenRefund);
    if (!refunded) revert RefundFailed(txHash, maxRefundedGas);
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function _isApprovalBasedWithMaxFlow(bytes calldata input) internal pure returns (bool) {
    return input.length > 4 && bytes4(input[0:4]) == PaymasterFlows.approvalBasedWithMax.selector;
  }

  function _transferFrom(
    address from,
    address token,
    uint256 amount
  ) private returns (bool success) {
    if (amount == 0) return true;

    if (token == NATIVE) {
      uint256 balance = _balance()[from];

      success = balance >= amount;
      if (success) _balance()[from] = balance - amount;
    } else {
      success = IERC20(token).safeTransferFrom(from, address(this), amount);
    }
  }

  function _transfer(address token, address to, uint256 amount) private returns (bool success) {
    if (amount == 0) return true;

    if (token == NATIVE) {
      (success, ) = payable(to).call{value: amount}('');
    } else {
      success = IERC20(token).safeTransfer(to, amount);
    }
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _balance() internal pure returns (mapping(address => uint256) storage s) {
    assembly ('memory-safe') {
      // keccack256('Paymaster.balance')
      s.slot := 0x48c72df064a775c3eff33e1c7f42c80b407c2586e8f014260c01a06141e51a3a
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
