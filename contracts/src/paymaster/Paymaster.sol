// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import {BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {Withdrawable} from './Withdrawable.sol';
import {PriceOracle, PriceOracleConfig} from './PriceOracle.sol';
import {PaymasterFlows} from './PaymasterFlow.sol';
import {SafeERC20} from 'src/libraries/SafeERC20.sol';

contract Paymaster is IPaymaster, Withdrawable, PriceOracle {
  using SafeERC20 for IERC20;

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error OnlyCallableByBootloader();
  error InvalidPaymasterInput();
  error PaymasterAmountBelowMin(address token, uint256 amount, uint256 minAmount);
  error FailedToPayBootloader(uint256 bootloaderFee);

  /*//////////////////////////////////////////////////////////////
                               CONSTANTS
  //////////////////////////////////////////////////////////////*/

  uint256 internal constant POST_TRANSACTION_ESTIMATED_GAS_COST = 4000;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor(
    address owner,
    PriceOracleConfig memory oracleConfig
  ) Withdrawable(owner) PriceOracle(oracleConfig) {}

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {
    _ethAllowance()[msg.sender] += msg.value;
  }

  /*//////////////////////////////////////////////////////////////
                          TRANSACTION PAYMENT
  //////////////////////////////////////////////////////////////*/

  function validateAndPayForPaymasterTransaction(
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    SystemTransaction calldata systx
  ) external payable onlyBootloader returns (bytes4 magic, bytes memory context) {
    if (!_isApprovalBasedWithMaxFlow(systx.paymasterInput)) revert InvalidPaymasterInput();

    (address token, uint256 amount) = abi.decode(systx.paymasterInput[4:68], (address, uint256));
    uint256 networkFee = systx.gasLimit * systx.maxFeePerGas;
    uint256 ethPerToken = _price(ETH, token);
    uint256 minAmount = networkFee * ethPerToken;
    // paymasterFee = amount - minAmount;

    if (amount < minAmount) revert PaymasterAmountBelowMin(token, amount, minAmount);

    address from = address(uint160(systx.from));
    if (_transferFrom(from, token, amount)) {
      magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
    }

    // Pay bootloader
    (bool bootloaderPaid, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: networkFee}('');
    if (!bootloaderPaid) revert FailedToPayBootloader(networkFee);

    context = abi.encode(token, ethPerToken);
  }

  function postTransaction(
    bytes calldata context,
    SystemTransaction calldata systx,
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    ExecutionResult /* txResult */,
    uint256 maxRefundedGas /* gasLeft() before calling postTransaction() */
  ) external payable onlyBootloader {
    if (maxRefundedGas < POST_TRANSACTION_ESTIMATED_GAS_COST) return;

    (address token, uint256 ethPerToken) = abi.decode(context, (address, uint256));
    uint256 refundEth = systx.maxFeePerGas * (maxRefundedGas - POST_TRANSACTION_ESTIMATED_GAS_COST);
    uint256 refundAmount = refundEth * ethPerToken;

    address account = address(uint160(systx.from));
    IERC20(token).safeTransfer(account, refundAmount); // No revert upon failure, though it should never happen
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

    if (token == ETH) {
      uint256 allowance = _ethAllowance()[from];

      success = allowance >= amount;
      if (success) _ethAllowance()[from] = allowance - amount;
    } else {
      success = IERC20(token).safeTransferFrom(from, address(this), amount);
    }
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _ethAllowance() private pure returns (mapping(address => uint256) storage s) {
    assembly ('memory-safe') {
      // keccack256('Paymaster.ethAllowance')
      s.slot := 0x83f39f26ea023df7a049022a2132e47c1b07e9e164eab419384e126f5ce28735
    }
  }

  function ethAllowance(address account) external view returns (uint256 allowance) {
    return _ethAllowance()[account];
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
