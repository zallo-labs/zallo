import { ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts';
// import { ExecutionTxStruct, Account } from '../generated/Account/Account';

const CHAIN_ID = 0; // zkSync FIXME: chain id is always 0

const DOMAIN_TYPE_HASH: ByteArray = crypto.keccak256(
  ByteArray.fromUTF8('EIP712Domain(uint256 chainId,address verifyingContract)'),
);

const TX_TYPEHASH: ByteArray = crypto.keccak256(
  ByteArray.fromUTF8('Tx(address to,uint256 value,bytes data,uint256 nonce)'),
);

function getDomainSeparator(contract: ethereum.SmartContract): Bytes {
  const typeHash = ethereum.Value.fromFixedBytes(
    Bytes.fromByteArray(DOMAIN_TYPE_HASH),
  );
  const chainId = ethereum.Value.fromI32(CHAIN_ID);
  const addr = ethereum.Value.fromAddress(contract._address);

  const tuple = changetype<ethereum.Tuple>([typeHash, chainId, addr]);

  const hash = crypto.keccak256(
    ethereum.encode(ethereum.Value.fromTuple(tuple))!,
  );
  return Bytes.fromByteArray(hash);
}

function typedDataHash(
  contract: ethereum.SmartContract,
  structHash: Bytes,
): Bytes {
  const prefix = ethereum.Value.fromFixedBytes(Bytes.fromHexString('0x1901'));
  const domainSeparator = ethereum.Value.fromFixedBytes(
    getDomainSeparator(contract),
  );
  const structHashValue = ethereum.Value.fromBytes(structHash);

  const tuple = changetype<ethereum.Tuple>([
    prefix,
    domainSeparator,
    structHashValue,
  ]);

  const hash = crypto.keccak256(
    ethereum.encode(ethereum.Value.fromTuple(tuple))!,
  );
  return Bytes.fromByteArray(hash);
}

// export function hashTx(account: Account, tx: ExecutionTxStruct): Bytes {
//   const type = ethereum.Value.fromFixedBytes(Bytes.fromByteArray(TX_TYPEHASH));
//   const to = ethereum.Value.fromAddress(tx.to);
//   const value = ethereum.Value.fromUnsignedBigInt(tx.value);
//   const dataHash = crypto.keccak256(
//     ethereum.encode(ethereum.Value.fromBytes(tx.data))!,
//   );
//   const dataHashValue = ethereum.Value.fromFixedBytes(
//     Bytes.fromByteArray(dataHash),
//   );
//   const nonce = ethereum.Value.fromUnsignedBigInt(tx.nonce);

//   const tuple = changetype<ethereum.Tuple>([
//     type,
//     to,
//     value,
//     dataHashValue,
//     nonce,
//   ]);

//   const structHash = crypto.keccak256(
//     ethereum.encode(ethereum.Value.fromTuple(tuple))!,
//   );

//   return typedDataHash(account, Bytes.fromByteArray(structHash));
// }
