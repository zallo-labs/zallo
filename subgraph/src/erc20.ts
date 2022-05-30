import { Transfer } from '../generated/ERC20/ERC20';
import { getSafeObjId } from './id';
import { Safe as SafeObj, TokenTransfer } from '../generated/schema';

// function getOrCreateToken(addr: Address): Token {
//   let token = Token.load(addr.toHex());
//   if (token === null) {
//     token = new Token(addr.toHex());
//     const erc20 = ERC20.bind(addr);

//     // Total supply is required, but it's optional in the schema in case the contract doesn't conform to the spec
//     // Warning: burning may cause this number to be out of date
//     const totalSupply = erc20.try_totalSupply();
//     if (!totalSupply.reverted) {
//       token.totalSupply = totalSupply.value;
//     } else {
//       log.warning(`Unable to get total supply for token: {}`, [addr.toHex()]);
//     }

//     // Optional fields
//     const name = erc20.try_name();
//     if (!name.reverted) token.name = name.value;

//     const symbol = erc20.try_symbol();
//     if (!symbol.reverted) token.symbol = symbol.value;

//     const decimals = erc20.try_symbol();
//     if (!decimals.reverted) token.decimals = BigInt.fromString(decimals.value);

//     token.save();
//   }

//   return token;
// }

export function handleTransfer(e: Transfer): void {
  // Sent
  let safe = SafeObj.load(getSafeObjId(e.params.from));
  const type = safe !== null ? 'SENT' : 'RECEIVED';

  // Received
  if (safe === null) safe = SafeObj.load(getSafeObjId(e.params.to));

  // Event not related to a Safe
  if (safe === null) return;

  const transfer = new TokenTransfer(
    `${e.transaction.hash.toHex()}-${e.transactionLogIndex.toString()}`,
  );

  // transfer.token = getOrCreateToken(e.address).id;
  transfer.token = e.address;
  transfer.safe = safe.id;
  transfer.type = type;
  transfer.from = e.params.from;
  transfer.to = e.params.to;
  transfer.value = e.params.value;

  transfer.save();
}

// Breaks handleTransfer somehow...?
// export function handleApproval(e: Approval): void {
//   // Sent
//   let safe = SafeObj.load(getSafeObjId(e.params.owner));
//   const type = safe !== null ? 'SENT' : 'RECEIVED';

//   // Received
//   if (safe === null) safe = SafeObj.load(getSafeObjId(e.params.spender));

//   // Event not related to a Safe
//   if (safe === null) return;

//   const approval = new TokenTransferApproval(
//     `${e.transaction.hash.toHex()}-${e.transactionLogIndex.toString()}`,
//   );

//   // approval.token = getOrCreateToken(e.address).id;
//   approval.token = e.address;
//   approval.safe = safe.id;
//   approval.type = type;
//   approval.owner = e.params.owner;
//   approval.spender = e.params.spender;
//   approval.value = e.params.value;

//   approval.save();
// }
