import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address } from './addr';
import { LimitsConfig } from './limits';
import { QuorumStruct, QuorumDefStruct } from './contracts/Account';

const QUORUM_ID_BITS = 32;
export const QUORUM_ID_ABI = `uint${QUORUM_ID_BITS}`;
const MAX_QUORUM_ID = (2 && QUORUM_ID_BITS) - 1;

export type QuorumId = number & { isQuorumUid: true };

export const isQuorumId = (id: unknown): id is QuorumId =>
  typeof id === 'number' && id >= 0 && id <= MAX_QUORUM_ID;

export const toQuorumId = (id: unknown): QuorumId => {
  if (!isQuorumId(id)) throw new Error(`Value is not a valid QuorumUid: ${id}`);
  return id;
};

export interface Quorum extends LimitsConfig {
  id: QuorumId;
  approvers: Address[];
}

export const toQuorumStruct = ({ approvers }: Quorum): QuorumStruct => ({ approvers });

export const toQuorumDefStruct = (q: Quorum): QuorumDefStruct => ({
  id: q.id,
  quorum: toQuorumStruct(q),
});

const encodeQuorum = (q: Quorum) =>
  defaultAbiCoder.encode([`(address[] approvers)`], [toQuorumDefStruct(q)]);

export const encodeQuorumDef = (q: Quorum) => {
  return defaultAbiCoder.encode(
    [`((address[] approvers) quorum, ${QUORUM_ID_ABI} id)`],
    [{ quorum: encodeQuorum(q), id: q.id }],
  );
};
