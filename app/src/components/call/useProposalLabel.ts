import { ZERO_ADDR } from 'lib';
import { Proposal } from '~/queries/proposal';
import { useContractMethod } from '~/queries/useContractMethod.api';
import { useDecodeQuorumMethodsData } from '~/screens/proposal/useDecodeQuorumMethodsData';
import { uppercaseFirst } from '~/util/string';

export const TRANSFER_LABEL = 'Transfer';

export const useProposalLabel = (p?: Proposal) => {
  const method = useContractMethod(p);
  const quorum = useDecodeQuorumMethodsData(p?.account ?? ZERO_ADDR, p?.data);

  if (!method) return !p?.value ? TRANSFER_LABEL : undefined;

  if (quorum?.method === 'upsert') return `Modify ${quorum.name}`;
  if (quorum?.method === 'remove') return `Remove ${quorum.name}`;

  return uppercaseFirst(method.fragment.name) || method.sighash;
};
