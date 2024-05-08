// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UUPSUpgradeable} from '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol';

import {SelfOwned} from '~/helpers/SelfOwned.sol';

abstract contract Upgradeable is UUPSUpgradeable, SelfOwned {
  function _authorizeUpgrade(address newImplementation) internal virtual override onlySelf {} // solhint-disable-lint no-empty-blocks
}
