// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

// import '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol';
import './UUPSUpgradeable.sol'; // OZ UUPSUpgradeable can't be used due to use of 'immutable' and a bug with zksync

import './SelfOwned.sol';

abstract contract Upgradeable is UUPSUpgradeable, SelfOwned {
  function _authorizeUpgrade(address newImplementation)
    internal
    virtual
    override
    onlySelf
  {}
}
