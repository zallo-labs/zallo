import { useContractFunction } from '@api/contracts';
import { ZERO_ADDR } from 'lib';
import { match } from 'ts-pattern';
import { Proposal } from '@api/proposal';
import { useTryDecodeAccountFunctionData } from './useTryDecodeAccountFunctionData';
import { uppercaseFirst } from '~/util/string';
import { useAddressLabel } from '../address/AddressLabel';
import { useDecodedTransfer } from './useDecodedTransfer';

export const TRANSFER_LABEL = 'Transfer';

export const useProposalLabel = (p: Proposal | undefined) => {
  const func = useContractFunction(p);
  const accountMethod = useTryDecodeAccountFunctionData(p?.account ?? ZERO_ADDR, p?.data);
  const transfer = useDecodedTransfer(p);
  const to = useAddressLabel(transfer?.to ?? p?.to);

  if (!func) return p?.value ? `${TRANSFER_LABEL} to ${to}` : `Call ${to}`;

  if (transfer) return `${TRANSFER_LABEL} to ${to}`;

  if (accountMethod) {
    return match(accountMethod)
      .with({ type: 'addPolicy' }, (p) => `Add policy: ${p.name}`)
      .with({ type: 'removePolicy' }, (p) => `Remove policy: ${p.name}`)
      .exhaustive();
  }

  const funcName = uppercaseFirst(func.fragment.name) || func.selector;
  return `${funcName} on ${to}`;
};
