import { ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import keccak256 from 'keccak256';
import { Address, compareAddress } from './addr';
import { LimitsConfig } from './limits';

export interface UserConfigStruct {
  approvers: Address[];
}

export interface UserConfig extends LimitsConfig {
  approvers: Address[];
}

type UserConfigish = UserConfig | UserConfigStruct;

export const toUserConfigStruct = (
  config: UserConfigish,
): UserConfigStruct => ({
  approvers: [...config.approvers].sort(compareAddress),
});

export const compareUserConfig = (a: UserConfigish, b: UserConfigish) =>
  Buffer.compare(userConfigToLeaf(a), userConfigToLeaf(b));

export const USER_CONFIG_TUPLE = '(address[] approvers)';

export const encodeUserConfig = (config: UserConfigish) =>
  defaultAbiCoder.encode([USER_CONFIG_TUPLE], [toUserConfigStruct(config)]);

export const userConfigToLeaf = (config: UserConfigish) =>
  keccak256(encodeUserConfig(config));

export const hashUserConfig = (config: UserConfigish) =>
  ethers.utils.keccak256(encodeUserConfig(config));
