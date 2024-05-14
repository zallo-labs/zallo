// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {UnitTest, console} from 'test/UnitTest.sol';
import {PaymasterFlow, PaymasterFlows} from 'src/paymaster/PaymasterFlow.sol';
import {Token20} from 'test/mock/Token20.sol';

contract PaymasterFlowTest is UnitTest {
  address private immutable PAYMASTER = makeAddr('Paymaster');

  Token20 private erc20 = new Token20();

  /*//////////////////////////////////////////////////////////////
                             PAY PAYMASTER
  //////////////////////////////////////////////////////////////*/

  function testFuzz_approvalBasedWithMax_LteMax_Native_SetAllowance(
    uint64 amount,
    uint64 maxAmount
  ) public {
    vm.assume(amount <= maxAmount);
    deal(address(this), amount);

    this.payPaymaster(_approvalBasedWithMax(PAYMASTER, address(0), amount, maxAmount));

    assertEq(PAYMASTER.balance, amount);
  }

  function testFuzz_approvalBasedWithMax_LteMax_ERC20_SetAllowance(
    uint64 amount,
    uint64 maxAmount
  ) public {
    vm.assume(amount <= maxAmount);
    deal(address(erc20), address(this), amount);

    this.payPaymaster(_approvalBasedWithMax(PAYMASTER, address(erc20), amount, maxAmount));

    assertEq(erc20.allowance(address(this), PAYMASTER), amount);
  }

  function testFuzz_approvalBasedWithMax_RevertWhen_GtMax(uint64 amount, uint64 maxAmount) public {
    vm.assume(amount > maxAmount);

    vm.expectRevert(
      abi.encodeWithSelector(PaymasterFlow.FeeAmountAboveMax.selector, amount, maxAmount)
    );

    this.payPaymaster(_approvalBasedWithMax(PAYMASTER, address(0), amount, maxAmount));
  }

  function testFuzz_approvalBased_Native_SetAllowance(uint64 amount) public {
    deal(address(this), amount);

    this.payPaymaster(_approvalBased(PAYMASTER, address(0), amount));

    assertEq(PAYMASTER.balance, amount);
  }

  function testFuzz_approvalBased_ERC20_SetAllowance(uint64 amount) public {
    deal(address(erc20), address(this), amount);

    this.payPaymaster(_approvalBased(PAYMASTER, address(erc20), amount));

    assertEq(erc20.allowance(address(this), PAYMASTER), amount);
  }

  function testFuzz_otherFlow(uint160 paymaster, bytes memory paymasterInput) public pure {
    vm.assume(
      paymasterInput.length < 4 ||
        (bytes4(paymasterInput) != PaymasterFlows.approvalBasedWithMax.selector &&
          bytes4(paymasterInput) != PaymasterFlows.approvalBased.selector)
    );

    SystemTransaction memory systx;
    systx.paymaster = paymaster;
    systx.paymasterInput = paymasterInput;
  }

  /*//////////////////////////////////////////////////////////////
                         SIGNED PAYMASTER INPUT
  //////////////////////////////////////////////////////////////*/

  function testFuzz_signedPaymasterInput_approvalBasedWithMax(
    address token,
    uint256 amount,
    uint256 maxAmount
  ) public view {
    bytes memory signedPaymasterInput_ = this.signedPaymasterInput(
      _approvalBasedWithMax(address(0), token, amount, maxAmount)
    );
    assertEq(signedPaymasterInput_, abi.encode(token, maxAmount));
  }

  function testFuzz_signedPaymasterInput_OtherFlows(bytes memory paymasterInput) public view {
    vm.assume(
      paymasterInput.length < 4 ||
        bytes4(paymasterInput) != PaymasterFlows.approvalBasedWithMax.selector
    );

    SystemTransaction memory systx;
    systx.paymasterInput = paymasterInput;

    assertEq(this.signedPaymasterInput(systx), paymasterInput);
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function payPaymaster(SystemTransaction calldata systx) external {
    PaymasterFlow.payPaymaster(systx);
  }

  function signedPaymasterInput(
    SystemTransaction calldata systx
  ) external pure returns (bytes memory) {
    return PaymasterFlow.signedPaymasterInput(systx);
  }

  function _approvalBasedWithMax(
    address paymaster,
    address token,
    uint256 amount,
    uint256 maxAmount
  ) private pure returns (SystemTransaction memory systx) {
    systx.paymaster = uint160(paymaster);
    systx.paymasterInput = abi.encodeWithSelector(
      PaymasterFlows.approvalBasedWithMax.selector,
      token,
      amount,
      maxAmount
    );
  }

  function _approvalBased(
    address paymaster,
    address token,
    uint256 amount
  ) private pure returns (SystemTransaction memory systx) {
    systx.paymaster = uint160(paymaster);
    systx.paymasterInput = abi.encodeWithSelector(
      PaymasterFlows.approvalBased.selector,
      token,
      amount
    );
  }
}
