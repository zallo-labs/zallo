import { BigInt, store } from '@graphprotocol/graph-ts';
import { RuleAdded, RuleRemoved } from '../generated/Account/Account';
import { Account, Rule } from '../generated/schema';
import { getOrCreateAccountWithoutImpl } from './account';

export function handleRuleAdded(e: RuleAdded): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getRuleId(account, e.params.key);
  let rule = Rule.load(id);
  if (!rule) {
    rule = new Rule(id);
    rule.account = account.id;
    rule.key = e.params.key;
  }

  rule.dataHash = e.params.dataHash;

  rule.save();
}

export function handleRuleRemoved(e: RuleRemoved): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getRuleId(account, e.params.key);
  if (Rule.load(id)) store.remove('Rule', id);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function getRuleId(account: Account, key: BigInt): string {
  // {account.id}-{key}
  return `${account.id.toHex()}-${key}`;
}
