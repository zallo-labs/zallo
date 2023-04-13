import { ACCOUNT_INTERFACE } from 'lib';
import { AccountInterface } from 'lib/dist/contracts/Account';

const account = (f: keyof AccountInterface['functions']) =>
  ACCOUNT_INTERFACE.getSighash(ACCOUNT_INTERFACE.functions[f]);
export const FUNCTION_DESCRIPTIONS: Record<string, string> = {
  /* Account */
  [account('addPolicy((uint32,uint8,address[],(uint8,bytes)[]))')]: 'Add policy to account',
  [account('removePolicy(uint32)')]: 'Remove policy from account',
  [account('upgradeTo(address)')]: 'Upgrade account',
  [account('upgradeToAndCall(address,bytes)')]: 'Upgrade account (with migration)',
  /* ERC20 */
  // approve(address,uint256)
  '0x095ea7b3': 'Pre-approve transfer of token',
  // transferFrom(address,address,uint256)
  '0x23b872dd': 'Transfer token from another account',
  // transfer(address,uint256)
  '0xa9059cbb': 'Transfer token',
};
