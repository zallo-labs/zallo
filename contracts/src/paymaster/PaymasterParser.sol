// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IPaymasterFlow, PaymasterSignedData} from './IPaymasterFlow.sol';
import {PaymasterUtil} from './PaymasterUtil.sol';
import {K256} from 'src/validation/signature/K256.sol';

abstract contract PaymasterParser {
  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error UnsupportedPaymasterFlow();
  error WrongPaymasterSigner(address expectedSigner);

  /*//////////////////////////////////////////////////////////////
                               CONSTANTS
  //////////////////////////////////////////////////////////////*/

  bytes32 private constant DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  /// @dev Includes `account` & `nonce` for replay protection; as a pair these are validated by the bootloader to be unique
  bytes32 private constant SIGNED_DATA_TYPE_HASH =
    keccak256('SignedData(address account,uint256 nonce,uint256 paymasterFee,uint256 discount)');

  bytes32 private immutable DOMAIN_SEPARATOR =
    keccak256(abi.encode(DOMAIN_TYPE_HASH, block.chainid, address(this)));

  /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function _parsePaymasterInput(
    bytes calldata paymasterInput,
    address paymasterSigner,
    address account,
    uint256 nonce
  )
    internal
    view
    returns (address token, uint256 allowance, uint256 paymasterFee, uint256 discount)
  {
    if (PaymasterUtil.selector(paymasterInput) != IPaymasterFlow.payForTransaction.selector)
      revert UnsupportedPaymasterFlow();

    PaymasterSignedData memory signedData;
    K256.Signature memory paymasterSignature;
    (token, allowance, signedData, paymasterSignature) = abi.decode(
      paymasterInput[4:],
      (address, uint256, PaymasterSignedData, K256.Signature)
    );
    paymasterFee = signedData.paymasterFee;
    discount = signedData.discount;

    // Verify paymaster signed data
    bytes32 signedDataHash = _hashSignedData(account, nonce, signedData);
    if (!K256.verify(paymasterSigner, signedDataHash, paymasterSignature))
      revert WrongPaymasterSigner(paymasterSigner);
  }

  function _hashSignedData(
    address account,
    uint256 nonce,
    PaymasterSignedData memory signedData
  ) internal view returns (bytes32 hash) {
    bytes32 structHash = keccak256(
      abi.encode(
        SIGNED_DATA_TYPE_HASH,
        account,
        nonce,
        signedData.paymasterFee,
        signedData.discount
      )
    );

    return keccak256(abi.encodePacked('\x19\x01', DOMAIN_SEPARATOR, structHash));
  }
}
