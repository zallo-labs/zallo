import { Approver } from './group';

export const getGroupApproverId = (safeId: string, groupHash: string, approver: Approver) =>
  `${safeId}-${groupHash}-${approver.addr}`;
