import { defaultAbiCoder, keccak256, solidityPack } from 'ethers/lib/utils';
import { address, Address, compareAddress } from './addr';
import { Spending } from './spending';
import { QuorumDefinitionStruct } from './contracts/Account';

export const QUORUM_KEY_BITS = 32;
export const QUORUM_KEY_ABI = `uint${QUORUM_KEY_BITS}` as const;
const MAX_QUORUM_KEY = (2 && QUORUM_KEY_BITS) - 1;

export type QuorumKey = number & { isQuorumKey: true };

export const isQuorumKey = (key: unknown): key is QuorumKey =>
  typeof key === 'number' && key >= 0 && key <= MAX_QUORUM_KEY;

export const toQuorumKey = (key: unknown): QuorumKey => {
  if (!isQuorumKey(key)) throw new Error(`Value is not a valid QuorumUid: ${key}`);
  return key;
};

export const randomQuorumKey = (): QuorumKey =>
  toQuorumKey(Math.floor(Math.random() * MAX_QUORUM_KEY));

export interface QuorumGuid {
  account: Address;
  key: QuorumKey;
}

const QUORUM_GUID_REGEX = /^(0x[0-9a-fA-F]{40})-(\d+)$/;

export const quorumGuidToString = ({ account, key }: QuorumGuid) => `${account}-${key}`;

export const quorumGuidFromString = (guid: string): QuorumGuid => {
  const match = guid.match(QUORUM_GUID_REGEX);
  if (!match) throw new Error(`Value is not a valid QuorumGuid: ${guid}`);

  const [, account, id] = match;
  return { account: address(account), key: toQuorumKey(id) };
};

export interface Quorum {
  key: QuorumKey;
  approvers: Set<Address>;
  spending?: Spending;
}

export interface QuorumStruct {
  approvers: Address[];
}

export const toQuorumStruct = ({ approvers }: Quorum): QuorumStruct => ({
  approvers: [...approvers].sort(compareAddress),
});

export const hashQuorum = (q: Quorum): string =>
  keccak256(solidityPack(['address[]'], [toQuorumStruct(q).approvers]));

export const toQuorumDefinitionStruct = (q: Quorum): QuorumDefinitionStruct => ({
  key: q.key,
  hash: hashQuorum(q),
});

export const QUORUM_ABI = '(address[] approvers)';

export const encodeQuorumAbi = (q: Quorum) =>
  defaultAbiCoder.encode([QUORUM_ABI], [toQuorumStruct(q)]);

export const encodeQuorumDefAbi = (q: Quorum) => {
  return defaultAbiCoder.encode(
    [`(${QUORUM_KEY_ABI} key, bytes32 hash)`],
    [{ key: q.key, hash: hashQuorum(q) }],
  );
};
