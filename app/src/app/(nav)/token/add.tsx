import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { FormSelectChip } from '#/fields/FormSelectChip';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { zodResolver } from '@hookform/resolvers/zod';
import { CHAIN_ENTRIES } from '@network/chains';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { asUAddress } from 'lib';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';
import { useSelectedChain } from '~/hooks/useSelectedAccount';
import { zAddress, zChain } from '~/lib/zod';
import { ADDRESS_FIELD_RULES } from '~/util/form.rules';

const scheme = z.object({
  address: zAddress(),
  chain: zChain(),
});

export default function AddTokenScreen() {
  const router = useRouter();

  const { control, handleSubmit } = useForm<z.infer<typeof scheme>>({
    resolver: zodResolver(scheme),
    defaultValues: { chain: useSelectedChain() },
  });

  return (
    <>
      <AppbarOptions headline="Add token" />

      <ScrollableScreenSurface>
        <View style={styles.container}>
          <FormTextField
            label="Address"
            name="address"
            placeholder="0x..."
            wrap
            control={control}
            rules={{
              ...ADDRESS_FIELD_RULES,
              required: true,
            }}
          />

          <FormSelectChip
            name="chain"
            control={control}
            entries={CHAIN_ENTRIES}
            chipProps={{ style: styles.chain }}
          />
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            control={control}
            onPress={handleSubmit(({ address, chain }) =>
              router.replace({
                pathname: '/(nav)/token/[token]',
                params: { token: asUAddress(address, chain) },
              }),
            )}
          >
            Continue
          </FormSubmitButton>
        </Actions>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = createStyles({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
    gap: 16,
  },
  chain: {
    alignSelf: 'flex-end',
  },
});

export { ErrorBoundary } from '#/ErrorBoundary';
