// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {PythStructs} from '@pythnetwork/pyth-sdk-solidity/PythStructs.sol';

import {UnitTest, console2} from 'test/UnitTest.sol';
import {PriceOracle, Rate} from 'src/paymaster/PriceOracle.sol';

contract PriceOracleTest is UnitTest, PriceOracle {
  constructor() PriceOracle(makeAddr('Pyth')) {}

  /*//////////////////////////////////////////////////////////////
                                 PRICE
  //////////////////////////////////////////////////////////////*/

  function test_price_ValidPrice(address token, int64 price, int32 expo, Config memory tc) public {
    vm.assume(price > 0 && expo <= 0 && expo > -255 && tc.decimals <= 18);
    _configs[token] = tc;

    _mockPrice(token, 123, 0);
    assertEq(_price(token), 123e18);

    _mockPrice(token, 123_456e3, -3);
    assertEq(_price(token), 123_456e18);

    _mockPrice(token, 1.2e18, -18);
    assertEq(_price(token), 1.2e18);
  }

  function testFail_price_RevertWhen_PriceNotPositive(
    address token,
    int64 price,
    int32 expo
  ) public {
    vm.assume(price <= 0);
    _mockPrice(token, price, expo);

    // Can't be expected due to internal pyth call
    // vm.expectRevert(abi.encodeWithSelector(PriceOracle.InvalidPrice.selector, token));

    _price(token);
  }

  function testFail_price_RevertWhen_ExponentPositive(address token, int32 expo) public {
    vm.assume(expo > 0);

    PythStructs.Price memory p;
    p.price = 1;
    p.expo = expo;
    _mockPrice(token, p);

    // vm.expectRevert(abi.encodeWithSelector(PriceOracle.InvalidPrice.selector, token));

    _price(token);
  }

  function testFail_price_RevertWhen_ExponentTooSmall(address token, int32 expo) public {
    vm.assume(expo < -18);

    PythStructs.Price memory p;
    p.price = 1;
    p.expo = expo;
    _mockPrice(token, p);

    // vm.expectRevert(abi.encodeWithSelector(PriceOracle.InvalidPrice.selector, token));

    _price(token);
  }

  /*//////////////////////////////////////////////////////////////
                                  RATE
  //////////////////////////////////////////////////////////////*/

  function test_rate_TokensDiffer(
    address base,
    int64 basePrice,
    address quote,
    int64 quotePrice
  ) public {
    vm.assume(base != quote && basePrice > 0 && quotePrice > 0);

    _configs[base] = Config({priceId: bytes32('1'), decimals: 0});
    _configs[quote] = Config({priceId: bytes32('2'), decimals: 0});
    _mockPrice(base, basePrice, 0);
    _mockPrice(quote, quotePrice, 0);

    Rate memory rate = _rate(base, quote);
    assertEq(rate.basePrice, uint256(uint64(basePrice)) * 1e18);
    assertEq(rate.quotePrice, uint256(uint64(quotePrice)) * 1e18);
  }

  function test_rate_TokensSame(address token, int64 price) public {
    vm.assume(price > 0);

    _configs[token] = Config({priceId: bytes32('1'), decimals: 0});
    _mockPrice(token, price, 0);

    Rate memory rate = _rate(token, token);
    assertEq(rate.basePrice, 1);
    assertEq(rate.quotePrice, 1);
  }

  /*//////////////////////////////////////////////////////////////
                              CONVERT DOWN
  //////////////////////////////////////////////////////////////*/

  function test_convertDown(address base, address quote) public {
    vm.assume(base != quote);
    _configs[base].decimals = 18;
    _configs[quote].decimals = 18;

    // Multiple
    _mockPrice(base, 2, 0);
    _mockPrice(quote, 1, 0);
    assertEq(_convertDown(_convertDown(1e18, _rate(base, quote)), _rate(quote, base)), 1e18);

    // Fractional
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 3, 0);
    assertEq(_convertDown(_convertDown(15e18, _rate(base, quote)), _rate(quote, base)), 15e18);

    // Round down
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 3, 0);
    assertEq(
      _convertDown(_convertDown(15.55e18, _rate(base, quote)), _rate(quote, base)),
      15549999999999999999
    );

    // Zero -> zero
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 1, 0);
    assertEq(_convertDown(_convertDown(0, _rate(base, quote)), _rate(quote, base)), 0);

    // Non-zero -> zero
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 5, 0);
    assertEq(_convertDown(_convertDown(1, _rate(base, quote)), _rate(quote, base)), 0);
  }

  function test_convertUp(address base, address quote) public {
    vm.assume(base != quote);
    _configs[base].decimals = 18;
    _configs[quote].decimals = 18;

    // Multiple
    _mockPrice(base, 2, 0);
    _mockPrice(quote, 1, 0);
    assertEq(_convertUp(_convertUp(1e18, _rate(base, quote)), _rate(quote, base)), 1e18);

    // Fractional
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 3, 0);
    assertEq(_convertUp(_convertUp(15e18, _rate(base, quote)), _rate(quote, base)), 15e18);

    // Round up
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 3, 0);
    assertEq(
      _convertUp(_convertUp(15.55e18, _rate(base, quote)), _rate(quote, base)),
      15550000000000000002
    );

    // Zero -> zero
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 1, 0);
    assertEq(_convertUp(_convertUp(0, _rate(base, quote)), _rate(quote, base)), 0);

    // Round up from 0.x
    // 1 -> ceil(0.2) -> 1
    _mockPrice(base, 1, 0);
    _mockPrice(quote, 5, 0);
    assertEq(_convertUp(1, _rate(base, quote)), 1);
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  struct Config {
    bytes32 priceId;
    uint8 decimals;
  }

  mapping(address => Config) internal _configs;

  function _decimals(address token) internal view override returns (uint8) {
    return _configs[token].decimals;
  }

  function _priceId(address token) internal view override returns (bytes32 priceId) {
    return _configs[token].priceId;
  }

  function _mockPrice(address token, int64 price, int32 expo) internal {
    if (_configs[token].priceId == bytes32(0)) _configs[token].priceId = bytes20(token);

    PythStructs.Price memory p;
    p.price = price;
    p.expo = expo;

    _mockPrice(token, p);
  }

  function _mockPrice(address token, PythStructs.Price memory p) internal {
    vm.mockCall(
      address(PYTH),
      abi.encodeWithSelector(
        PYTH.getPriceNoOlderThan.selector,
        _priceId(token),
        uint256(60 minutes)
      ),
      abi.encode(p)
    );
  }
}
