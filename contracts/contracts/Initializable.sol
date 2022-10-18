// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

/// @notice Track whether the contract has been initialized
/// Heavily inspired by OZ's Initializable contract
/// Modified to be more gas efficient for our simple use case
abstract contract Initializable {
  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  modifier initializer() {
    Initialized storage initialized = _initialized();
    require(initialized.version == 0);
    initialized.version = 1;
    _;
  }

  modifier reinitializer(uint8 version) {
    Initialized storage initialized = _initialized();
    require(initialized.version < version);
    initialized.version = version;
    _;
  }

  /// @notice Prevent the contract from further initialization
  /// @dev To be used inside the constructor of an implementation contract
  function _disableInitializers() internal {
    _initialized().version = type(uint8).max;
  }

  /*//////////////////////////////////////////////////////////////
                                 STORAGE
  //////////////////////////////////////////////////////////////*/

  struct Initialized {
    uint8 version;
  }

  /// @dev keccak256('Initializable.initialized')
  bytes32 private constant _INITIALIZED_SLOT =
    0x69f4cfcde55304a353bee9f8f2bbfc2fcb65cf3f3ca694d821cc348abe696c33;

  function _initialized()
    private
    pure
    returns (Initialized storage initialized)
  {
    assembly {
      initialized.slot := _INITIALIZED_SLOT
    }
  }
}
