import { Address } from './addr';
import { Account } from './contracts';
import { Id, toId } from './id';
import { createTx, TxReq } from './tx';
import {
  UserConfig,
  compareUserConfig,
  UserConfigStruct,
  userConfigToLeaf,
  toUserConfigStruct,
} from './userConfig';

export interface UserId {
  account: Address;
  addr: Address;
}

export interface User {
  addr: Address;
  configs: UserConfig[];
}

export interface UserStruct {
  addr: string;
  configs: UserConfigStruct[];
}

export const getUserIdStr = (account: string, user: Address): Id =>
  toId(`${account}-${user}`);

export const toUserStruct = (user: User): UserStruct => ({
  addr: user.addr,
  configs: user.configs.map(toUserConfigStruct).sort(compareUserConfig),
});

export const getUserMerkleRoot = (user: User) => {
  return user.configs.sort(compareUserConfig).map(userConfigToLeaf);
};

export const createUpsertUserTx = (account: Account, user: User): TxReq =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('upsertUser', [
      toUserStruct(user),
    ]),
  });

export const createRemoveUserTx = (account: Account, user: User): TxReq =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('removeUser', [user.addr]),
  });
