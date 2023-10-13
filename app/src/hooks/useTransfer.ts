import { useSelectAddress } from '~/hooks/useSelectAddress';
import { TransferScreenParams } from '~/app/[account]/transfer';
import { O } from 'ts-toolbelt';
import { useRouter } from 'expo-router';

export function useTransfer() {
  const router = useRouter();
  const selectAddress = useSelectAddress();

  return async (params: O.Optional<TransferScreenParams, 'to'>) => {
    params.to ??= await selectAddress({
      include: ['accounts', 'contacts'],
      disabled: [params.account],
    });

    return router.push({ pathname: `/[account]/transfer`, params });
  };
}
