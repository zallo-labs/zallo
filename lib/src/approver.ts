import { BytesLike, ethers } from 'ethers';
import { Approver } from './group';

export const getGroupApproverId = (
  safeId: string,
  groupHash: BytesLike,
  approver: Approver,
) => `${safeId}-${ethers.utils.hexlify(groupHash)}-${approver.addr}`;
