import { useSelectAddress } from '~/hooks/useSelectAddress';
import { TransferScreenParams } from '~/app/(drawer)/[account]/transfer';
import { O } from 'ts-toolbelt';
import { useRouter } from 'expo-router';
import { asAddress } from 'lib';

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
