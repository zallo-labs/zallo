// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IPyth} from '@pythnetwork/pyth-sdk-solidity/IPyth.sol';
import {PythStructs} from '@pythnetwork/pyth-sdk-solidity/PythStructs.sol';
import {FixedPointMathLib} from 'solady/src/utils/FixedPointMathLib.sol';

import {Cast} from 'src/libraries/Cast.sol';

struct Rate {
  address base;
  uint256 basePrice;
  address quote;
  uint256 quotePrice;
}

abstract contract PriceOracle {
  using Cast for uint256;
  using FixedPointMathLib for uint256;

  error InvalidPrice(address token);

  uint8 private constant WAD = 18; // 18 decimal precision
  int8 private constant MIN_PRICE_EXPO = -1 * int8(WAD); // Constrainted by WAD, and the max price int64 (~1e19) decimals

  IPyth internal immutable PYTH;

  constructor(address pyth) {
    PYTH = IPyth(pyth);
  }

  function _decimals(address token) internal view virtual returns (uint8 decimals);
  function _priceId(address token) internal view virtual returns (bytes32 priceId);

  function _price(address token) internal view returns (uint256 usd) {
    PythStructs.Price memory price = PYTH.getPriceNoOlderThan(_priceId(token), 60 minutes);

    if (price.price <= 0 || price.expo > 0 || price.expo < MIN_PRICE_EXPO)
      revert InvalidPrice(token);

    uint8 curDecimals = uint8(uint32(-1 * price.expo));
    return _toDecimals(uint128(uint64(price.price)), curDecimals, WAD);
  }

  function _rate(address base, address quote) internal view returns (Rate memory rate) {
    if (base == quote) return Rate({base: base, basePrice: 1, quote: quote, quotePrice: 1});

    return Rate({base: base, basePrice: _price(base), quote: quote, quotePrice: _price(quote)});
  }

  function _convertDown(uint256 amount, Rate memory r) internal view returns (uint256 quoteAmount) {
    uint256 normBaseAmount = _toDecimals(amount, _decimals(r.base), WAD);
    uint256 converted = normBaseAmount.mulDiv(r.basePrice, r.quotePrice); // floor(normBaseAmount * r.basePrice / r.quotePrice)

    return _toDecimals(converted, WAD, _decimals(r.quote));
  }

  function _convertUp(uint256 amount, Rate memory r) internal view returns (uint256 quoteAmount) {
    uint256 normBaseAmount = _toDecimals(amount, _decimals(r.base), WAD);
    uint256 converted = normBaseAmount.mulDivUp(r.basePrice, r.quotePrice); // ceil(normBaseAmount * r.basePrice / r.quotePrice)

    return _toDecimals(converted, WAD, _decimals(r.quote));
  }

  function _toDecimals(
    uint256 amount,
    uint8 currentDecimals,
    uint8 newDecimals
  ) private pure returns (uint256 normalized) {
    if (currentDecimals == newDecimals) return amount;

    if (newDecimals >= currentDecimals) {
      return amount * 10 ** (newDecimals - currentDecimals);
    } else {
      return amount / 10 ** (currentDecimals - newDecimals);
    }
  }
}
