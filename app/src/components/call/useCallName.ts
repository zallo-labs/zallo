import { Call } from 'lib';
import { useContractMethod } from '~/queries/useContractMethod.api';
import {
  getRemoveWalletMethodName,
  useDecodedRemoveWallet,
} from '~/screens/transaction/details/method/wallet/RemoveWalletMethod';
import {
  getUpsertWalletMethodName,
  useDecodedUpsertWallet,
} from '~/screens/transaction/details/method/wallet/UpsertWalletMethod';
import { uppercaseFirst } from '~/util/string';

export const useCallName = (call?: Call) => {
  const method = useContractMethod(call);

  const upsertWallet = useDecodedUpsertWallet(call);
  const removeWallet = useDecodedRemoveWallet(call);

  if (!method) return !call?.value.isZero() ? 'Transfer' : undefined;

  if (upsertWallet) return getUpsertWalletMethodName(upsertWallet);
  if (removeWallet) return getRemoveWalletMethodName(removeWallet);

  return uppercaseFirst(method.fragment.name) || method.sighash;
};
