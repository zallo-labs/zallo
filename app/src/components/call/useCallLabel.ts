import { Call } from 'lib';
import { useContractMethod } from '~/queries/useContractMethod.api';
import { uppercaseFirst } from '~/util/string';

export const useCallLabel = (call?: Call) => {
  const [method] = useContractMethod(call);

  // TODO: implement decoded call names
  // const upsertWallet = useDecodedUpsertUser(call);
  // const removeWallet = useDecodedRemoveUser(call);

  if (!method) return !call?.value.isZero() ? 'Transfer' : undefined;

  // if (upsertWallet) return getUpsertWalletMethodName(upsertWallet);
  // if (removeWallet) return getRemoveWalletMethodName(removeWallet);

  return uppercaseFirst(method.fragment.name) || method.sighash;
};
