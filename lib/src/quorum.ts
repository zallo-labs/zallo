import { defaultAbiCoder } from 'ethers/lib/utils';
import { address, Address } from './addr';
import { SpendingConfig } from './limits';
import { QuorumStruct, QuorumDefStruct } from './contracts/Account';

export const QUORUM_KEY_BITS = 32;
export const QUORUM_KEY_ABI = `uint${QUORUM_KEY_BITS}`;
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
  spending: SpendingConfig;
}

export const toQuorumStruct = ({ approvers }: Quorum): QuorumStruct => ({
  approvers: [...approvers],
});

export const toQuorumDefStruct = (q: Quorum): QuorumDefStruct => ({
  key: q.key,
  quorum: toQuorumStruct(q),
});

const encodeQuorum = (q: Quorum) =>
  defaultAbiCoder.encode([`(address[] approvers)`], [toQuorumDefStruct(q)]);

export const encodeQuorumDef = (q: Quorum) => {
  return defaultAbiCoder.encode(
    [`((address[] approvers) quorum, ${QUORUM_KEY_ABI} id)`],
    [{ quorum: encodeQuorum(q), key: q.key }],
  );
};
