// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

struct OtherMessageConfig {
  bool allow;
}

library OtherMessageHook {
  error OtherMessageDenied();

  function validateMessage(
    bytes memory configData,
    bool previouslyHandled
  ) internal pure returns (bool handled) {
    // A message is 'other' if it isn't handled by any other hooks
    if (previouslyHandled) return false;

    OtherMessageConfig memory config = abi.decode(configData, (OtherMessageConfig));
    if (!config.allow) revert OtherMessageDenied();

    return true;
  }
}
