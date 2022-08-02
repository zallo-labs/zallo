import { Address, compareAddresses } from './addr';
import keccak256 from 'keccak256';
import { defaultAbiCoder, hexlify } from 'ethers/lib/utils';
import { bufferToBytes } from './bytes';

export type Quorum = Address[] & { isQuorum: true };

export const toQuorum = (approvers: Address[]): Quorum =>
  approvers.sort(compareAddresses) as Quorum;

export const quorumToLeaf = (quorum: Quorum) =>
  keccak256(defaultAbiCoder.encode(['address[]'], [quorum]));

export const hashQuorum = (quorum: Quorum): string =>
  hexlify(bufferToBytes(quorumToLeaf(quorum)));

export type Quorums = Quorum[] & { isQuorums: true };

export const toQuorums = (quorumsDef: Quorum[]): Quorums =>
  quorumsDef
    .map((q) => ({ q, leaf: quorumToLeaf(q) }))
    .sort((a, b) => Buffer.compare(a.leaf, b.leaf))
    .map(({ q }) => q) as Quorums;
