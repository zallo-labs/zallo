// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Withdrawable} from 'src/paymaster/Withdrawable.sol';
import {Token20} from 'test/mock/Token20.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

contract WithdrawableTest is UnitTest {
  address alice = makeAddr('Alice');

  /*//////////////////////////////////////////////////////////////
                                WITHDRAW
  //////////////////////////////////////////////////////////////*/

  function testFuzz_withdraw_CalledByOwner_Native_LteBalance(uint64 amount, uint64 balance) public {
    vm.assume(amount <= balance);

    Withdrawable w = new TestWithdrawable(address(this));
    deal(address(w), balance);

    w.withdraw(alice, address(0), amount);
    assertEq(alice.balance, amount);
  }

  function testFuzz_withdraw_CalledByOwner_Native_RevertWhen_GtBalance(
    uint64 amount,
    uint64 balance
  ) public {
    vm.assume(amount > balance);

    Withdrawable w = new TestWithdrawable(address(this));
    deal(address(w), balance);

    vm.expectRevert(Withdrawable.WithdrawlFailed.selector);

    w.withdraw(alice, address(0), amount);
  }

  function testFuzz_withdraw_CalledByOwner_ERC20_LteBalance(uint64 amount, uint64 balance) public {
    vm.assume(amount <= balance);

    Token20 token = new Token20();
    Withdrawable w = new TestWithdrawable(address(this));
    deal(address(token), address(w), balance);

    w.withdraw(alice, address(token), amount);
    assertEq(token.balanceOf(alice), amount);
  }

  function testFuzz_withdraw_CalledByOwner_ERC20_RevertWhen_GtBalance(
    uint64 amount,
    uint64 balance
  ) public {
    vm.assume(amount > balance);

    Token20 token = new Token20();
    Withdrawable w = new TestWithdrawable(address(this));
    deal(address(token), address(w), balance);

    vm.expectRevert(Withdrawable.WithdrawlFailed.selector);

    w.withdraw(alice, address(token), amount);
  }

  function testFuzz_withdraw_RevertWhen_CalledByOther(
    address owner,
    address token,
    uint256 amount
  ) public {
    vm.assume(owner != address(0) && owner != address(this));
    Withdrawable w = new TestWithdrawable(owner);

    vm.expectRevert(
      abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, address(this))
    );

    w.withdraw(address(this), token, amount);
  }
}

contract TestWithdrawable is Withdrawable {
  constructor(address owner) Withdrawable(owner) {}
}
