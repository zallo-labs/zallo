import {
  AccountUpserted,
  AccountRemoved,
  TxExecuted,
  TxReverted,
} from '../generated/Safe/Safe';
import { Account, Tx } from '../generated/schema';
import { getAccountId, getSafeId, getTxId } from './id';
import { getOrCreateQuorum } from './quorum';
import { getOrCreateAccount, getOrCreateSafe } from './util';

export function handleTxExecuted(e: TxExecuted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeId(e.address);
  tx.hash = e.params.txHash;
  tx.success = true;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleTxReverted(e: TxReverted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeId(e.address);
  tx.hash = e.params.txHash;
  tx.success = false;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleAccountUpserted(e: AccountUpserted): void {
  const safe = getOrCreateSafe(e.address);

  const account = getOrCreateAccount(
    getAccountId(safe.id, e.params.accountRef),
  );
  account.safe = safe.id;
  account.ref = e.params.accountRef;
  account.active = true;
  account.save();

  // Add quorums
  for (let i = 0; i < e.params.quorums.length; ++i) {
    const quorumBytes = e.params.quorums[i];
    getOrCreateQuorum(account, quorumBytes, e);
  }
}

export function handleAccountRemoved(e: AccountRemoved): void {
  const safe = getOrCreateSafe(e.address);
  const account = Account.load(getAccountId(safe.id, e.params.accountRef));
  if (account) {
    account.active = false;
    account.save();
  }
}
