import { ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import keccak256 from 'keccak256';
import { Address, sortAddresses } from './addr';
import { UserConfigStruct } from './contracts/Account';
import { LimitsConfig } from './limits';

export interface UserConfig extends LimitsConfig {
  approvers: Address[];
}

export const toUserConfigStruct = (config: UserConfig): UserConfigStruct => ({
  approvers: sortAddresses(config.approvers),
});

export const USER_CONFIG_TUPLE = '(address[] approvers)';

export const encodeUserConfig = (config: UserConfig) =>
  defaultAbiCoder.encode([USER_CONFIG_TUPLE], [toUserConfigStruct(config)]);

export const userConfigToLeaf = (config: UserConfig) =>
  keccak256(encodeUserConfig(config));

export const hashUserConfig = (config: UserConfig) =>
  ethers.utils.keccak256(encodeUserConfig(config));
