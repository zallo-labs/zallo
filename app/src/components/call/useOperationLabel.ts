import { useContractFunction } from '@api/contracts';
import { match } from 'ts-pattern';
import { Proposal } from '@api/proposal';
import { useTryDecodeAccountFunctionData } from './useTryDecodeAccountFunctionData';
import { uppercaseFirst } from '~/util/string';
import { useAddressLabel } from '../address/AddressLabel';
import { Operation } from 'lib';

export const TRANSFER_LABEL = 'Transfer';

export const useOperationLabel = (p: Proposal, op: Operation) => {
  const func = useContractFunction(op);
  const accountMethod = useTryDecodeAccountFunctionData(p.account, op.data);
  const transfer = (p?.transaction?.receipt?.transfers ?? p?.simulation?.transfers)?.find(
    (t) => t.token === op.to,
  );
  const to = useAddressLabel(transfer?.to ?? op.to);

  if (!func) return op.value ? `${TRANSFER_LABEL} to ${to}` : `Call ${to}`;

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
