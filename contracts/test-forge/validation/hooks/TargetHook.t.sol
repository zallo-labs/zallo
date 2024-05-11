// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {TargetHook, TargetsConfig, ContractConfig} from 'src/validation/hooks/TargetHook.sol';
import {PLACEHOLDER_SELF_ADDRESS} from 'src/validation/hooks/SelfAddress.sol';
import {Operation} from 'src/execution/Transaction.sol';

contract TargetHookTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                          VALIDATE OPERATIONS
  //////////////////////////////////////////////////////////////*/

  function testFuzz_validateOperations_AllAllowed(Operation[] memory ops) public pure {
    TargetsConfig memory c;
    c.defaultAllow = true;

    TargetHook.validateOperations(ops, abi.encode(c));
  }

  function testFuzz_validateOperations_RevertWhen_AnyDenied(
    Operation[] memory ops,
    uint256 selected
  ) public {
    vm.assume(selected < ops.length);
    // Ensure no other op is to the selected op; this is required so that our expectRevert matches the right one
    for (uint256 i; i < ops.length; ++i) {
      if (i != selected) vm.assume(ops[i].to != ops[selected].to);
    }

    TargetsConfig memory c;
    c.defaultAllow = true;
    c.contracts = new ContractConfig[](1);
    c.contracts[0].addr = ops[selected].to;
    c.contracts[0].allow = false;

    vm.expectRevert(
      abi.encodeWithSelector(
        TargetHook.TargetDenied.selector,
        ops[selected].to,
        bytes4(ops[selected].data)
      )
    );
    TargetHook.validateOperations(ops, abi.encode(c));
  }

  /*//////////////////////////////////////////////////////////////
                           VALIDATE OPERATION
  //////////////////////////////////////////////////////////////*/

  function testFuzz_validateOperation_TargetExists_TargetAllowed_RevertWhen_SelectorExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0] = ContractConfig({
      addr: to,
      allow: true,
      excludedSelectors: _selectorExcluded(selector, excludedSelectors)
    });

    vm.expectRevert(abi.encodeWithSelector(TargetHook.TargetDenied.selector, to, selector));
    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetExists_TargetAllowed_SelectorNotExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public pure {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0] = ContractConfig({
      addr: to,
      allow: true,
      excludedSelectors: _selectorNotExcluded(selector, excludedSelectors)
    });

    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetExists_TargetDenied_SelectorExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public pure {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0] = ContractConfig({
      addr: to,
      allow: false,
      excludedSelectors: _selectorExcluded(selector, excludedSelectors)
    });

    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetExists_TargetDenied_RevertWhen_SelectorNotExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0] = ContractConfig({
      addr: to,
      allow: false,
      excludedSelectors: _selectorNotExcluded(selector, excludedSelectors)
    });

    vm.expectRevert(abi.encodeWithSelector(TargetHook.TargetDenied.selector, to, selector));
    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetNotExists_DefaultAllowed_RevertWhen_SelectorExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public {
    TargetsConfig memory c;
    c.defaultAllow = true;
    c.defaultExcludedSelectors = _selectorExcluded(selector, excludedSelectors);

    vm.expectRevert(abi.encodeWithSelector(TargetHook.TargetDenied.selector, to, selector));
    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetNotExists_DefaultAllowed_SelectorNotExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public pure {
    TargetsConfig memory c;
    c.defaultAllow = true;
    c.defaultExcludedSelectors = _selectorNotExcluded(selector, excludedSelectors);

    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetNotExists_DefaultDeny_SelectorExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public pure {
    TargetsConfig memory c;
    c.defaultAllow = false;
    c.defaultExcludedSelectors = _selectorExcluded(selector, excludedSelectors);

    TargetHook.validateOperation(_op(to, selector), c);
  }

  function testFuzz_validateOperation_TargetNotExists_DefaultDeny_RevertWhen_SelectorNotExcluded(
    address to,
    bytes4 selector,
    bytes4[] memory excludedSelectors
  ) public {
    TargetsConfig memory c;
    c.defaultAllow = false;
    c.defaultExcludedSelectors = _selectorNotExcluded(selector, excludedSelectors);

    vm.expectRevert(abi.encodeWithSelector(TargetHook.TargetDenied.selector, to, selector));
    TargetHook.validateOperation(_op(to, selector), c);
  }

  /*//////////////////////////////////////////////////////////////
                              CHECK CONFIG
  //////////////////////////////////////////////////////////////*/

  function test_checkConfig_ContractsSelectorsSorted() public pure {
    TargetsConfig memory c;
    c.defaultExcludedSelectors = new bytes4[](3);
    c.defaultExcludedSelectors[0] = bytes4(0x00000000);
    c.defaultExcludedSelectors[1] = bytes4(0x00000100);
    c.defaultExcludedSelectors[2] = bytes4(0xffffffff);

    c.contracts = new ContractConfig[](3);
    c.contracts[0].addr = address(0);
    c.contracts[1].addr = address(50);
    c.contracts[2].addr = address(10000);
    c.contracts[2].excludedSelectors = c.defaultExcludedSelectors;

    TargetHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_DefaultExcludedSelectorsNotUnique() public {
    TargetsConfig memory c;
    c.defaultExcludedSelectors = new bytes4[](2);
    c.defaultExcludedSelectors[0] = bytes4(0xffffffff);
    c.defaultExcludedSelectors[1] = bytes4(0xffffffff);

    vm.expectRevert(TargetHook.SelectorsNotAsc.selector);
    TargetHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_DefaultExcludedSelectorsNotAsc() public {
    TargetsConfig memory c;
    c.defaultExcludedSelectors = new bytes4[](2);
    c.defaultExcludedSelectors[0] = bytes4(0xffffffff);
    c.defaultExcludedSelectors[1] = bytes4(0x00000010);

    vm.expectRevert(TargetHook.SelectorsNotAsc.selector);
    TargetHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_ContractsNotUnique() public {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](3);
    c.contracts[0].addr = address(0);
    c.contracts[1].addr = address(1);
    c.contracts[2].addr = address(1);

    vm.expectRevert(TargetHook.ContractsNotAsc.selector);
    TargetHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_ContractsNotAsc() public {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](3);
    c.contracts[0].addr = address(0);
    c.contracts[1].addr = address(2);
    c.contracts[2].addr = address(1);

    vm.expectRevert(TargetHook.ContractsNotAsc.selector);
    TargetHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_ExcludedSelectorsNotUnique() public {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0].excludedSelectors = new bytes4[](2);
    c.contracts[0].excludedSelectors[0] = bytes4(0xffffffff);
    c.contracts[0].excludedSelectors[1] = bytes4(0xffffffff);

    vm.expectRevert(TargetHook.SelectorsNotAsc.selector);
    TargetHook.checkConfig(abi.encode(c));
  }

  function test_checkConfig_RevertWhen_ExcludedSelectorsNotAsc() public {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0].excludedSelectors = new bytes4[](2);
    c.contracts[0].excludedSelectors[0] = bytes4(0xffffffff);
    c.contracts[0].excludedSelectors[1] = bytes4(0x10000000);

    vm.expectRevert(TargetHook.SelectorsNotAsc.selector);
    TargetHook.checkConfig(abi.encode(c));
  }

  /*//////////////////////////////////////////////////////////////
                          REPLACE SELF ADDRESS
  //////////////////////////////////////////////////////////////*/

  function test_replaceSelfAddress_PlaceholderExists_ReplaceWithSelf() public view {
    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0].addr = PLACEHOLDER_SELF_ADDRESS;

    c = abi.decode(TargetHook.replaceSelfAddress(abi.encode(c)), (TargetsConfig));
    assertEq(c.contracts[0].addr, address(this));
  }

  function testFuzz_replaceSelfAddress_PlaceholderExists_ContractAsc(address midAddr) public view {
    vm.assume(PLACEHOLDER_SELF_ADDRESS < midAddr && midAddr < address(this));

    TargetsConfig memory c;
    c.contracts = new ContractConfig[](2);
    c.contracts[0].addr = PLACEHOLDER_SELF_ADDRESS;
    c.contracts[1].addr = midAddr;

    c = abi.decode(TargetHook.replaceSelfAddress(abi.encode(c)), (TargetsConfig));
    assertEq(c.contracts[1].addr, address(this));
  }

  function testFuzz_replaceSelfAddress_NoPlaceholder_DoesNotReplace(address addr) public view {
    vm.assume(addr != PLACEHOLDER_SELF_ADDRESS);

    TargetsConfig memory c;
    c.contracts = new ContractConfig[](1);
    c.contracts[0].addr = addr;

    c = abi.decode(TargetHook.replaceSelfAddress(abi.encode(c)), (TargetsConfig));
    assertEq(c.contracts[0].addr, addr);
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function _op(address to) internal pure returns (Operation memory op) {
    op.to = to;
  }

  function _op(address to, bytes4 selector) internal pure returns (Operation memory op) {
    op.to = to;
    op.data = abi.encode(selector);
  }

  function _selectorExcluded(
    bytes4 value,
    bytes4[] memory values
  ) internal pure returns (bytes4[] memory out) {
    out = new bytes4[](values.length + 1);
    out[0] = value;
    for (uint256 i; i < values.length; ++i) {
      out[i + 1] = values[i];
    }

    return _sort(out);
  }

  function _selectorNotExcluded(
    bytes4 value,
    bytes4[] memory values
  ) internal pure returns (bytes4[] memory) {
    for (uint256 i; i < values.length; ++i) {
      vm.assume(value != values[i]);
    }

    return _sort(values);
  }

  function _sort(address[] memory values) internal pure returns (address[] memory) {
    for (uint256 i; i < values.length; ++i) {
      for (uint256 j = i; j > 0; --j) {
        if (values[j] < values[j - 1]) (values[j], values[j - 1]) = (values[j - 1], values[j]);
      }
    }
    return values;
  }

  function _sort(bytes4[] memory values) internal pure returns (bytes4[] memory) {
    for (uint256 i = 1; i < values.length; ++i) {
      for (uint256 j = i; j > 0; --j) {
        if (values[j] < values[j - 1]) (values[j], values[j - 1]) = (values[j - 1], values[j]);
      }
    }
    return values;
  }
}
