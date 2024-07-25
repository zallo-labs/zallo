// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {BOOTLOADER_FORMAL_ADDRESS as BOOTLOADER} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {IPyth} from '@pythnetwork/pyth-sdk-solidity/IPyth.sol';
import {PythStructs} from '@pythnetwork/pyth-sdk-solidity/PythStructs.sol';

import {UnitTest} from 'test/UnitTest.sol';
import {Paymaster, Rate} from 'src/paymaster/Paymaster.sol';
import {PaymasterFlows} from 'src/paymaster/PaymasterFlow.sol';
import {ImmutablePriceOracle} from 'src/paymaster/ImmutablePriceOracle.sol';
import {Token20} from 'test/mock/Token20.sol';

contract PaymasterTest is UnitTest {
  address internal constant NATIVE = address(0);
  bytes4 internal constant FAILURE = bytes4(0);

  Token20 internal erc20 = new Token20();
  IPyth internal pyth = IPyth(makeAddr('Pyth'));
  TestPaymaster internal paymaster = new TestPaymaster(address(pyth), address(erc20));
  address internal account = makeAddr('Account');
  uint256 internal immutable POST_TRANSACTION_GAS_OFFSET =
    paymaster.expose_POST_TRANSACTION_GAS_OFFSET();

  function setUp() public override {
    deal(address(paymaster), type(uint128).max);
    deal(account, type(uint128).max);

    _mockPrice(NATIVE, 1, 0);
    _mockPrice(address(erc20), 1, 0);
  }

  /*//////////////////////////////////////////////////////////////
                                RECEIVE
  //////////////////////////////////////////////////////////////*/

  function testFuzz_receive_IncreaseBalance(uint64 amount) public {
    vm.assume(amount < address(this).balance);

    (bool success, ) = payable(paymaster).call{value: amount}('');
    assertTrue(success);
    assertEq(paymaster.expose_balance(address(this)), amount);
  }

  /*//////////////////////////////////////////////////////////////
               VALIDATE AND PAY FOR PAYMASTER TRANSACTION
  //////////////////////////////////////////////////////////////*/

  function test_validate_Bootloader_SupportedFlow_GteMin_BootloaderPaid_NativeToken_SufficientAllowance_SuccessMagic(
    uint64 amount,
    uint64 networkFee,
    uint64 balance
  ) public canPayBootloader(networkFee) {
    vm.assume(amount > 0 && amount >= networkFee);
    vm.assume(amount <= balance && balance <= account.balance);

    vm.prank(account);
    (bool success, ) = payable(paymaster).call{value: balance}('');
    assertTrue(success);

    vm.prank(BOOTLOADER);
    (bytes4 magic, ) = validate(_systx(NATIVE, amount, networkFee));
    assertEq(magic, PAYMASTER_VALIDATION_SUCCESS_MAGIC);
  }

  function test_validate_Bootloader_SupportedFlow_GteMin_BootloaderPaid_NativeToken_SufficientBalance_DecreaseAllowance(
    uint64 amount,
    uint64 networkFee,
    uint64 balance
  ) public canPayBootloader(networkFee) {
    vm.assume(amount > 0 && amount >= networkFee);
    vm.assume(amount <= balance && balance <= account.balance);

    vm.prank(account);
    (bool success, ) = payable(paymaster).call{value: balance}('');
    assertTrue(success);

    vm.prank(BOOTLOADER);
    validate(_systx(NATIVE, amount, networkFee));

    assertEq(paymaster.expose_balance(account), balance - amount);
  }

  function test_validate_Bootloader_SupportedFlow_GteMin_BootloaderPaid_NativeToken_FailWhen_InsufficientBalance(
    uint128 amount,
    uint128 networkFee
  ) public asBootloader canPayBootloader(networkFee) {
    vm.assume(amount > 0 && amount >= networkFee);

    (bytes4 magic, ) = validate(_systx(NATIVE, amount, networkFee));
    assertEq(magic, FAILURE);
  }

  function test_validate_Bootloader_SupportedFlow_GteMin_BootloaderPaid_ERC20Token_SufficientAllowance_SuccessMagic(
    uint64 amount,
    uint64 networkFee,
    uint64 allowance
  ) public canPayBootloader(networkFee) {
    vm.assume(amount > 0 && amount >= networkFee);
    vm.assume(amount <= allowance);

    deal(address(erc20), account, allowance);
    vm.prank(account);
    erc20.approve(address(paymaster), allowance);

    vm.prank(BOOTLOADER);
    (bytes4 magic, ) = validate(_systx(address(erc20), amount, networkFee));
    assertEq(magic, PAYMASTER_VALIDATION_SUCCESS_MAGIC);
  }

  function test_validate_Bootloader_SupportedFlow_GteMin_BootloaderPaid_ERC20Token_SufficientAllowance_IncreaseBalance(
    uint64 amount,
    uint64 networkFee,
    uint64 allowance
  ) public canPayBootloader(networkFee) {
    vm.assume(amount > 0 && amount >= networkFee);
    vm.assume(amount <= allowance);

    deal(address(erc20), account, allowance);
    vm.prank(account);
    erc20.approve(address(paymaster), allowance);

    vm.prank(BOOTLOADER);
    validate(_systx(address(erc20), amount, networkFee));

    assertEq(erc20.balanceOf(address(paymaster)), amount);
  }

  function test_validate_Bootloader_SupportedFlow_GteMin_BootloaderPaid_ERC20Token_FailWhen_InsufficientAllowance(
    uint64 amount,
    uint64 networkFee,
    uint64 allowance
  ) public canPayBootloader(networkFee) {
    vm.assume(amount > 0 && amount >= networkFee);
    vm.assume(amount <= allowance);

    vm.prank(BOOTLOADER);
    (bytes4 magic, ) = validate(_systx(address(erc20), amount, networkFee));
    assertEq(magic, FAILURE);
  }

  function test_validate_Bootloader_SupportedFlow_GteMin_RevertWhen_BootloaderNotPaid(
    uint256 amount,
    uint256 networkFee
  ) public asBootloader {
    vm.assume(amount > 0 && amount >= networkFee && networkFee > 0);
    vm.deal(address(paymaster), 0);

    vm.expectRevert(abi.encodeWithSelector(Paymaster.FailedToPayBootloader.selector, networkFee));

    validate(_systx(amount, networkFee));
  }

  function test_validate_Bootloader_SupportedFlow_FailWhen_LtMin(
    uint256 amount,
    uint256 networkFee
  ) public asBootloader {
    vm.assume(amount < networkFee);
    vm.assume(networkFee < address(paymaster).balance);

    (bytes4 magic, ) = validate(_systx(NATIVE, amount, networkFee));
    assertEq(magic, FAILURE);
  }

  function test_validate_Bootloader_RevertWhen_OtherFlow(
    bytes memory paymasterInput
  ) public asBootloader {
    vm.assume(
      paymasterInput.length < 4 ||
        bytes4(paymasterInput) != PaymasterFlows.approvalBasedWithMax.selector
    );

    SystemTransaction memory systx;
    systx.paymasterInput = paymasterInput;

    vm.expectRevert(Paymaster.InvalidPaymasterInput.selector);
    validate(systx);
  }

  function test_validate_RevertWhen_NotBootloader() public {
    SystemTransaction memory systx;

    vm.expectRevert(Paymaster.OnlyCallableByBootloader.selector);
    validate(systx);
  }

  /*//////////////////////////////////////////////////////////////
                            POST TRANSACTION
  //////////////////////////////////////////////////////////////*/

  function test_postTransaction_Bootloader_MaxRefundGteOffset_NativeToken_RefundAccount(
    uint64 maxRefundedGas
  ) public asBootloader {
    vm.assume(maxRefundedGas > POST_TRANSACTION_GAS_OFFSET);
    uint256 refundAmount = maxRefundedGas - POST_TRANSACTION_GAS_OFFSET;
    vm.assume(refundAmount < address(paymaster).balance);

    uint256 pre = account.balance;
    postTransaction(NATIVE, maxRefundedGas);
    assertEq(account.balance, pre + refundAmount);
  }

  function test_postTransaction_Bootloader_MaxRefundGteOffset_NativeToken_GasUsedLteOffset(
    uint64 maxRefundedGas
  ) public {
    vm.assume(maxRefundedGas > POST_TRANSACTION_GAS_OFFSET);

    // Validate setup
    uint256 amount = maxRefundedGas;
    vm.prank(account);
    (bool success, ) = payable(paymaster).call{value: amount}('');
    assertTrue(success);

    // validate
    vm.startPrank(BOOTLOADER);
    validate(_systx(NATIVE, amount, amount));

    // postTransaction
    uint256 gasUsed = postTransaction(NATIVE, maxRefundedGas);
    assertLe(gasUsed, POST_TRANSACTION_GAS_OFFSET);
  }

  function test_postTransaction_Bootloader_MaxRefundGteOffset_ERC20Token_RefundAccount(
    uint64 maxRefundedGas
  ) public asBootloader {
    vm.assume(maxRefundedGas > POST_TRANSACTION_GAS_OFFSET);

    uint256 refundAmount = maxRefundedGas - POST_TRANSACTION_GAS_OFFSET;
    deal(address(erc20), address(paymaster), refundAmount);

    postTransaction(address(erc20), maxRefundedGas);
    assertEq(erc20.balanceOf(account), refundAmount);
  }

  /// @dev Accurately tests gas used by postTransaction by factoring in storage slots touched
  function test_postTransaction_Bootloader_MaxRefundGteOffset_ERC20Token_GasUsedLteOffset(
    uint64 maxRefundedGas
  ) public {
    vm.assume(maxRefundedGas > POST_TRANSACTION_GAS_OFFSET);

    // Validate setup
    uint256 amount = maxRefundedGas;
    deal(address(erc20), account, amount);
    vm.prank(account);
    erc20.approve(address(paymaster), amount);

    // validate
    vm.startPrank(BOOTLOADER);
    validate(_systx(address(erc20), amount, amount));

    // postTransaction
    uint256 gasUsed = postTransaction(address(erc20), maxRefundedGas);
    assertLe(gasUsed, POST_TRANSACTION_GAS_OFFSET);
  }

  function test_postTransaction_Bootloader_MaxRefundLtOffset(
    uint16 maxRefundedGas
  ) public asBootloader {
    vm.assume(maxRefundedGas <= POST_TRANSACTION_GAS_OFFSET);

    postTransaction(NATIVE, maxRefundedGas);
  }

  function test_postTransaction_RevertWhen_NotBootloader() public {
    SystemTransaction memory systx;

    vm.expectRevert(Paymaster.OnlyCallableByBootloader.selector);
    validate(systx);
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function validate(
    SystemTransaction memory systx
  ) internal returns (bytes4 magic, bytes memory context) {
    return paymaster.validateAndPayForPaymasterTransaction(bytes32(0), bytes32(0), systx);
  }

  function postTransaction(
    address token,
    uint256 maxRefundedGas
  ) internal returns (uint256 gasUsed) {
    bytes memory context = abi.encode(paymaster.expose_rate(NATIVE, token));
    SystemTransaction memory systx;
    systx.from = uint256(uint160(account));
    systx.maxFeePerGas = 1;

    uint256 preGas = gasleft();
    paymaster.postTransaction(
      context,
      systx,
      bytes32(0),
      bytes32(0),
      ExecutionResult.Success,
      maxRefundedGas
    );
    gasUsed = preGas - gasleft();
  }

  modifier asBootloader() {
    vm.startPrank(BOOTLOADER);
    _;
    vm.stopPrank();
  }

  modifier canPayBootloader(uint256 networkFee) {
    deal(address(paymaster), networkFee);
    _;
  }

  function _systx(
    uint256 amount,
    uint256 networkFee
  ) internal view returns (SystemTransaction memory systx) {
    return _systx(NATIVE, amount, networkFee);
  }

  function _systx(
    address token,
    uint256 amount,
    uint256 networkFee
  ) internal view returns (SystemTransaction memory systx) {
    systx.from = uint256(uint160(account));
    systx.paymasterInput = abi.encodeWithSelector(
      PaymasterFlows.approvalBasedWithMax.selector,
      token,
      amount,
      amount
    );
    systx.maxFeePerGas = networkFee;
    systx.gasLimit = 1;
  }

  function _mockPrice(address token, int64 price, int32 expo) internal {
    PythStructs.Price memory p;
    p.price = price;
    p.expo = expo;

    _mockPrice(token, p);
  }

  function _mockPrice(address token, PythStructs.Price memory p) internal {
    bytes32 priceId = bytes32(bytes20(token));
    vm.mockCall(
      address(pyth),
      abi.encodeWithSelector(pyth.getPriceNoOlderThan.selector, priceId, uint256(60 minutes)),
      abi.encode(p)
    );
  }
}

contract TestPaymaster is Paymaster {
  constructor(
    address pyth,
    address dai
  )
    Paymaster(
      address(this),
      ImmutablePriceOracle.Config({
        pyth: pyth,
        nativePriceId: bytes32(bytes20(NATIVE)),
        dai: ImmutablePriceOracle.TokenConfig({token: dai, priceId: bytes32(bytes20(dai))}),
        usdc: _token('usdc'),
        weth: _token('weth'),
        reth: _token('reth'),
        cbeth: _token('cbeth')
      })
    )
  {}

  function _token(
    string memory name
  ) private pure returns (ImmutablePriceOracle.TokenConfig memory c) {
    c.token = address(bytes20(keccak256(bytes(name))));
    c.priceId = bytes32(bytes20(c.token));
  }

  function expose_rate(address base, address quote) external view returns (Rate memory) {
    return _rate(base, quote);
  }

  function expose_POST_TRANSACTION_GAS_OFFSET() external pure returns (uint256) {
    return POST_TRANSACTION_GAS_OFFSET;
  }

  function expose_balance(address account) external view returns (uint256) {
    return _balance()[account];
  }
}
