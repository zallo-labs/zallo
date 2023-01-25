import { ZERO_ADDR } from 'lib';
import { Proposal } from '~/queries/proposal';
import { useContractMethod } from '~/queries/useContractMethod.api';
import { useDecodeQuorumMethodsData } from '~/screens/proposal/useDecodeQuorumMethodsData';
import { uppercaseFirst } from '~/util/string';
import { useAddrName } from '../addr/useAddrName';
import { useDecodedTransfer } from './useDecodedTransfer';

export const TRANSFER_LABEL = 'Transfer';

export const useProposalLabel = (p?: Proposal) => {
  const method = useContractMethod(p);
  const quorum = useDecodeQuorumMethodsData(p?.account ?? ZERO_ADDR, p?.data);
  const transfer = useDecodedTransfer(p);
  const to = useAddrName(transfer?.to ?? p?.to);

  if (!method) return p?.value ? `${TRANSFER_LABEL} to ${to}` : `Call ${to}`;

  if (transfer) return `${TRANSFER_LABEL} to ${to}`;

  if (quorum) {
    if (quorum.method === 'upsert') return `Modify "${quorum.name}" quorum`;
    if (quorum.method === 'remove') return `Remove "${quorum.name}" quorum`;
  }

  const methodName = uppercaseFirst(method.fragment.name) || method.sighash;
  return `${methodName} on ${to}`;
};
