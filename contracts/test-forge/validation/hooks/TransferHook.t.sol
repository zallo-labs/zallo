// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {UnitTest, console2} from 'test/UnitTest.sol';
import {TransferHook, TransfersConfig, TransferLimit, TokenTransfer, TokenSpending} from 'src/validation/hooks/TransferHook.sol';
import {Operation} from 'src/execution/Transaction.sol';

contract TransferHookTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                             BEFORE EXECUTE
  //////////////////////////////////////////////////////////////*/

  function test_beforeExecute_AllAllowed() public {
    Operation[] memory ops = new Operation[](2);
    ops[0].value = 1;
    ops[1].value = 1;

    TransfersConfig memory config;
    config.defaultAllow = true;

    TransferHook.beforeExecute(ops, abi.encode(config));
  }

  function test_beforeExecute_RevertWhen_AnyDenied() public {
    Operation[] memory ops = new Operation[](2);
    ops[0].value = 1;
    address token = address(0x10);
    uint224 amount = 1;
    ops[1].to = token;
    ops[1].data = abi.encodeWithSelector(IERC20.transfer.selector, address(0), amount);

    TransfersConfig memory config;
    config.defaultAllow = true;
    config.limits = new TransferLimit[](1);
    config.limits[0].token = token;
    config.limits[0].amount = 0;
    config.limits[0].duration = 1;

    vm.expectRevert(
      abi.encodeWithSelector(
        TransferHook.TransferExceedsLimit.selector,
        token,
        amount,
        config.limits[0].amount
      )
    );
    TransferHook.beforeExecute(ops, abi.encode(config));
  }

  /*//////////////////////////////////////////////////////////////
                        BEFORE EXECUTE TRANSFER
  //////////////////////////////////////////////////////////////*/

  function testFuzz_beforeExecuteTransfer_ZeroTransfer(
    address token,
    TransfersConfig memory config
  ) public {
    TransferHook.beforeExecuteTransfer(TokenTransfer({token: token, amount: 0}), config);
  }

  function testFuzz_beforeExecuteTransfer_NewEpoch_LteLimit_SetSpending(
    TokenTransfer memory transfer,
    uint224 limit
  ) public {
    vm.assume(0 < transfer.amount && transfer.amount <= limit);

    TransfersConfig memory config;
    config.limits = new TransferLimit[](1);
    config.limits[0] = TransferLimit({token: transfer.token, amount: limit, duration: 1000});

    TokenSpending storage spending = TransferHook._spending(config.budget, transfer.token);
    spending.spent = 125;
    spending.timestamp = uint32(block.timestamp) - 1000;

    TransferHook.beforeExecuteTransfer(transfer, config);

    assertEq(spending.spent, transfer.amount, 'Spent transfer amount');
    assertEq(spending.timestamp, uint32(block.timestamp), 'Set timestamp');
  }

  function testFuzz_beforeExecuteTransfer_NewEpoch_RevertWhen_GtLimit(
    TokenTransfer memory transfer,
    uint224 limit
  ) public {
    vm.assume(0 < limit && limit < transfer.amount);

    TransfersConfig memory config;
    config.limits = new TransferLimit[](1);
    config.limits[0] = TransferLimit({token: transfer.token, amount: limit, duration: 1000});

    TokenSpending storage spending = TransferHook._spending(config.budget, transfer.token);
    spending.spent = 125;
    spending.timestamp = uint32(block.timestamp) - 1000;

    vm.expectRevert(
      abi.encodeWithSelector(
        TransferHook.TransferExceedsLimit.selector,
        transfer.token,
        transfer.amount,
        limit
      )
    );

    TransferHook.beforeExecuteTransfer(transfer, config);
  }

  function testFuzz_beforeExecuteTransfer_ExistingEpoch_LteLimit_AddSpending(
    TokenTransfer memory transfer,
    uint224 limit,
    uint128 prevSpent
  ) public {
    vm.assume((uint256(transfer.amount) + prevSpent) < type(uint224).max);
    vm.assume(transfer.amount + prevSpent <= limit);

    TransfersConfig memory config;
    config.limits = new TransferLimit[](1);
    config.limits[0] = TransferLimit({token: transfer.token, amount: limit, duration: 1000});

    uint32 prevTimestamp = uint32(block.timestamp) - 5;
    TokenSpending storage spending = TransferHook._spending(config.budget, transfer.token);
    spending.spent = prevSpent;
    spending.timestamp = prevTimestamp;

    TransferHook.beforeExecuteTransfer(transfer, config);

    assertEq(spending.spent, prevSpent + transfer.amount);
    assertEq(spending.timestamp, prevTimestamp);
  }

  function testFuzz_beforeExecuteTransfer_ExistingEpoch_RevertWhen_GtLimit(
    TokenTransfer memory transfer,
    uint224 limit,
    uint128 prevSpent
  ) public {
    vm.assume(transfer.amount > 0);
    vm.assume((uint256(transfer.amount) + prevSpent) < type(uint224).max);
    vm.assume(transfer.amount + prevSpent > limit);

    TransfersConfig memory config;
    config.limits = new TransferLimit[](1);
    config.limits[0] = TransferLimit({token: transfer.token, amount: limit, duration: 1000});

    TokenSpending storage spending = TransferHook._spending(config.budget, transfer.token);
    spending.spent = prevSpent;
    spending.timestamp = uint32(block.timestamp) - 5;

    vm.expectRevert(
      abi.encodeWithSelector(
        TransferHook.TransferExceedsLimit.selector,
        transfer.token,
        transfer.amount,
        limit
      )
    );

    TransferHook.beforeExecuteTransfer(transfer, config);
  }

  /*//////////////////////////////////////////////////////////////
                             GET TRANSFERS
  //////////////////////////////////////////////////////////////*/

  function testFuzz_getTransfers_NotTransfer(bytes memory data) public view {
    bytes4 s = bytes4(data);
    vm.assume(
      s != IERC20.transfer.selector &&
        s != IERC20.transferFrom.selector &&
        s != IERC20.approve.selector &&
        s != 0x39509351
    );

    Operation memory op;
    op.data = data;
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    _assertEmpty(transfers[0]);
    _assertEmpty(transfers[1]);
  }

  function testFuzz_getTransfers_NativeTransfer(uint96 amount) public view {
    Operation memory op;
    op.value = amount;
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    assertEq(transfers[0].token, address(0));
    assertEq(transfers[0].amount, amount);
    _assertEmpty(transfers[1]);
  }

  function testFuzz_getTransfers_Erc20Transfer(address token, uint224 amount) public view {
    Operation memory op;
    op.to = token;
    op.data = abi.encodeCall(IERC20.transfer, (address(0), amount));
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    _assertEmpty(transfers[0]);
    assertEq(transfers[1].token, token);
    assertEq(transfers[1].amount, amount);
  }

  function testFuzz_getTransfers_TransferFrom_ToAccount(
    address token,
    address from,
    uint224 amount
  ) public view {
    Operation memory op;
    op.to = token;
    op.data = abi.encodeCall(IERC20.transferFrom, (from, address(this), amount));
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    _assertEmpty(transfers[0]);
    _assertEmpty(transfers[1]);
  }

  function testFuzz_getTransfers_TransferFrom_ToAnotherAddress(
    address token,
    address from,
    address to,
    uint224 amount
  ) public view {
    vm.assume(to != address(this));

    Operation memory op;
    op.to = token;
    op.data = abi.encodeCall(IERC20.transferFrom, (from, to, amount));
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    _assertEmpty(transfers[0]);
    assertEq(transfers[1].token, token);
    assertEq(transfers[1].amount, amount);
  }

  function testFuzz_getTransfers_Erc20Approve(address token, uint224 amount) public view {
    Operation memory op;
    op.to = token;
    op.data = abi.encodeCall(IERC20.approve, (address(0), amount));
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    _assertEmpty(transfers[0]);
    assertEq(transfers[1].token, token);
    assertEq(transfers[1].amount, amount);
  }

  function testFuzz_getTransfers_Erc20IncreaseAllowance(address token, uint224 amount) public view {
    Operation memory op;
    op.to = token;
    op.data = abi.encodeWithSelector(0x39509351, address(0), amount);
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    _assertEmpty(transfers[0]);
    assertEq(transfers[1].token, token);
    assertEq(transfers[1].amount, amount);
  }

  function testFuzz_getTransfers_NativeAndErc20Transfer(
    uint96 nativeAmount,
    address token,
    uint224 erc20Amount
  ) public view {
    Operation memory op;
    op.value = nativeAmount;
    op.to = token;
    op.data = abi.encodeCall(IERC20.transfer, (address(0), erc20Amount));
    TokenTransfer[2] memory transfers = TransferHook.getTransfers(op);

    assertEq(transfers[0].token, address(0));
    assertEq(transfers[0].amount, nativeAmount);
    assertEq(transfers[1].token, token);
    assertEq(transfers[1].amount, erc20Amount);
  }

  /*//////////////////////////////////////////////////////////////
                              CHECK CONFIG
  //////////////////////////////////////////////////////////////*/

  function test_checkConfig_LimitsUniquelySortedAsc() public pure {
    TransfersConfig memory c;
    c.limits = new TransferLimit[](3);
    c.limits[0].token = address(0);
    c.limits[1].token = address(1);
    c.limits[2].token = address(500);

    TransferHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_LimitsNotUnique() public {
    TransfersConfig memory c;
    c.limits = new TransferLimit[](2);
    c.limits[0].token = address(0);
    c.limits[1].token = address(0);

    vm.expectRevert(TransferHook.TransferLimitsNotAsc.selector);
    TransferHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_LimitsNotAsc() public {
    TransfersConfig memory c;
    c.limits = new TransferLimit[](3);
    c.limits[0].token = address(0);
    c.limits[1].token = address(500);
    c.limits[2].token = address(499);

    vm.expectRevert(TransferHook.TransferLimitsNotAsc.selector);
    TransferHook.checkConfig(abi.encode(c));
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function _assertEmpty(TokenTransfer memory transfer) internal pure {
    TokenTransfer memory emptyTransfer;
    assertEq(transfer.token, emptyTransfer.token);
    assertEq(transfer.amount, emptyTransfer.amount);
  }
}
