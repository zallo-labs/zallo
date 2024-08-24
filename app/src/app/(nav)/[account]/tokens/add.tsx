import { Appbar } from '#/Appbar/Appbar';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { asChain, asUAddress } from 'lib';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';
import { zAddress, zChain } from '~/lib/zod';
import { ADDRESS_FIELD_RULES } from '~/util/form.rules';
import { AccountParams } from '../_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { Pane } from '#/layout/Pane';
import { Scrollable } from '#/Scrollable';
import { FormChainSelector } from '#/fields/FormChainSelector';

const scheme = z.object({
  address: zAddress(),
  chain: zChain(),
});

const Params = AccountParams;

export default function AddTokenScreen() {
  const { account } = useLocalParams(Params);
  const router = useRouter();

  const { control, handleSubmit } = useForm<z.infer<typeof scheme>>({
    resolver: zodResolver(scheme),
    defaultValues: { chain: asChain(account) },
  });

  return (
    <Pane flex>
      <Appbar mode="large" headline="Add token" />

      <Scrollable>
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

          <FormChainSelector name="chain" control={control} />
        </View>

        <Actions horizontal>
          <FormSubmitButton
            mode="contained"
            control={control}
            onPress={handleSubmit(({ address, chain }) =>
              router.replace({
                pathname: '/(nav)/[account]/tokens/[address]',
                params: { account, address: asUAddress(address, chain) },
              }),
            )}
          >
            Continue
          </FormSubmitButton>
        </Actions>
      </Scrollable>
    </Pane>
  );
}

const styles = createStyles({
  container: {
    marginHorizontal: 16,
    gap: 16,
  },
  chain: {
    alignSelf: 'flex-end',
  },
});

export { ErrorBoundary } from '#/ErrorBoundary';
