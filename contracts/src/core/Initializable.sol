// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

/// @notice Track whether the contract has been initialized
/// Heavily inspired by OZ's Initializable contract
/// Modified to be more gas efficient for our simple use case
abstract contract Initializable {
  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error AlreadyInitialized();

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  modifier initializer() {
    Initialized storage initialized = _initialized();
    if (initialized.version != 0) revert AlreadyInitialized();
    initialized.version = 1;
    _;
  }

  /// @notice Prevent the contract from further initialization
  /// @dev To be used inside the constructor of an implementation contract
  function _disableInitializers() internal {
    _initialized().version = type(uint64).max;
  }

  /*//////////////////////////////////////////////////////////////
                                 STORAGE
  //////////////////////////////////////////////////////////////*/

  struct Initialized {
    uint64 version;
  }

  function _initialized() private pure returns (Initialized storage initialized) {
    assembly ('memory-safe') {
      // keccak256('Initializable.initialized')
      initialized.slot := 0x69f4cfcde55304a353bee9f8f2bbfc2fcb65cf3f3ca694d821cc348abe696c33
    }
  }
}
