import { useSelectAddress } from '~/hooks/useSelectAddress';
import { SendScreenParams } from '~/app/(nav)/[account]/(home)/send';
import { O } from 'ts-toolbelt';
import { useRouter } from 'expo-router';
import { asAddress } from 'lib';

export function useSend() {
  const router = useRouter();
  const selectAddress = useSelectAddress();

  return async (params: O.Optional<SendScreenParams, 'to'>) => {
    params.to ??= asAddress(
      await selectAddress({
        headline: 'Send to',
        include: ['accounts', 'contacts'],
        disabled: [params.account],
      }),
    );

    if (params.to) router.push({ pathname: `/(nav)/[account]/send`, params });
  };
}
