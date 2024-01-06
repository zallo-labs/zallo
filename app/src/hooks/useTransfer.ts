import { useRouter } from 'expo-router';
import { O } from 'ts-toolbelt';

import { asAddress } from 'lib';
import { TransferScreenParams } from '~/app/(drawer)/[account]/transfer';
import { useSelectAddress } from '~/hooks/useSelectAddress';

export function useTransfer() {
  const router = useRouter();
  const selectAddress = useSelectAddress();

  return async (params: O.Optional<TransferScreenParams, 'to'>) => {
    params.to ??= asAddress(
      await selectAddress({
        include: ['accounts', 'contacts'],
        disabled: [params.account],
      }),
    );

    if (params.to) router.push({ pathname: `/(drawer)/[account]/transfer`, params });
  };
}
