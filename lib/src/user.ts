import { hexDataLength, hexlify, randomBytes } from 'ethers/lib/utils';
import { Address } from './addr';
import { Account } from './contracts';
import { UserStruct } from './contracts/Account';
import { Id, toId } from './id';
import { createTx, TxReq } from './tx';
import { UserConfig, userConfigToLeaf } from './userConfig';

export interface User {
  addr: Address;
  configs: UserConfig[];
}

export const getUserId = (account: string, user: Address): Id =>
  toId(`${account}-${user}`);

export const getApproverId = (
  account: string,
  user: Address,
  approver: Address,
) => toId(`${getUserId(account, user)}-${approver}`);

export const sortUserConfigs = (configs: UserConfig[]) =>
  configs
    .map((config) => ({ config, leaf: userConfigToLeaf(config) }))
    .sort((a, b) => Buffer.compare(a.leaf, b.leaf))
    .map(({ config }) => config);

export const toUserStruct = (user: User): UserStruct => ({
  addr: user.addr,
  configs: sortUserConfigs(user.configs),
});

export const getUserMerkleRoot = (user: User) => {
  const configs = sortUserConfigs(user.configs);
  return configs.map(userConfigToLeaf);
};

export const createUpsertUserTx = (account: Account, user: User): TxReq =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('upsertUser', [
      {
        addr: user.addr,
        configs: user.configs,
      },
    ]),
  });

export const createRemoveUserTx = (account: Account, user: User): TxReq =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('removeUser', [user.addr]),
  });
