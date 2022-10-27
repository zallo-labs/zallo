import { ZERO_ADDR } from 'lib';
import { Proposal } from '~/queries/proposal';
import { useContractMethod } from '~/queries/useContractMethod.api';
import {
  getRemoveUserMethodName,
  useDecodedRemoveUserMethod,
} from '~/screens/transaction/details/method/user/RemoveUserMethod';
import {
  getUpsertUserMethodName,
  useDecodedUpsertUserMethod,
} from '~/screens/transaction/details/method/user/UpsertUserMethod';
import { uppercaseFirst } from '~/util/string';

export const TRANSFER_LABEL = 'Transfer';

export const useProposalLabel = (p?: Proposal) => {
  const [method] = useContractMethod(p);
  const account = p?.account ?? ZERO_ADDR;

  const [, [upsertedUser]] = useDecodedUpsertUserMethod(account, p);
  const [, [removedUser]] = useDecodedRemoveUserMethod(account, p);

  if (!method) return !p?.value.isZero() ? TRANSFER_LABEL : undefined;

  if (upsertedUser) return getUpsertUserMethodName(upsertedUser);
  if (removedUser) return getRemoveUserMethodName(removedUser);

  return uppercaseFirst(method.fragment.name) || method.sighash;
};
