import { z } from 'zod';
import { zAddress, zChain, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useRouter } from 'expo-router';
import { Address, ZERO_ADDR, asAddress, asChain, asUAddress, tryAsUAddress } from 'lib';
import { RemoveIcon } from '@theme/icons';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { FormResetIcon } from '#/fields/ResetFormIcon';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { withSuspense } from '#/skeleton/withSuspense';
import { Chain } from 'chains';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelectedChain } from '~/hooks/useSelectedAccount';
import { Appbar } from '#/Appbar/Appbar';
import { Pane } from '#/layout/Pane';
import { FormChainSelector } from '#/fields/FormChainSelector';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { Address_ContactScreenQuery } from '~/api/__generated__/Address_ContactScreenQuery.graphql';
import { useUpsertContact } from '~/hooks/mutations/useUpsertContact';
import { useRemoveContact } from '~/hooks/mutations/useRemoveContact';
import { Scrollable } from '#/Scrollable';
import { createStyles } from '@theme/styles';

const Query = graphql`
  query Address_ContactScreenQuery($address: UAddress!, $include: Boolean!) {
    contact(address: $address) @include(if: $include) {
      id
      address
      name
      ...useRemoveContact_contact
    }

    ...useUpsertContact_query
    ...useRemoveContact_query
  }
`;

const schema = z.object({
  name: z.string().min(1),
  address: zAddress(),
  chain: zChain(),
});

export interface ContactScreenProps {
  address?: Address;
  chain?: Chain;
}

function ContactScreen_(props: ContactScreenProps) {
  const router = useRouter();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this contact',
  });
  const selectedChain = useSelectedChain();

  const existingAddress = tryAsUAddress(props.address, props.chain);
  const query = useLazyQuery<Address_ContactScreenQuery>(Query, {
    address: existingAddress ?? `zksync:${ZERO_ADDR}`,
    include: !!existingAddress,
  });
  const current = query.contact;
  const upsert = useUpsertContact({ query });
  const remove = useRemoveContact({ query, contact: query.contact });

  const { control, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: current?.name,
      address: props.address,
      chain: props.chain ?? selectedChain,
    },
  });

  const submit = handleSubmit(async (input) => {
    reset(input);

    const { name, address, chain } = input;
    const uaddress = asUAddress(address, chain);
    await upsert({
      name,
      address: uaddress,
      previousAddress: current?.address,
    });

    if (current?.address !== uaddress)
      router.replace({ pathname: `/(nav)/contacts/[address]`, params: { address: uaddress } });
  });

  return (
    <Pane flex>
      <Appbar
        mode="small"
        headline="Contact"
        {...(remove && {
          trailing: [
            (props) => <FormResetIcon control={control} reset={reset} {...props} />,
            (props) => (
              <AppbarMore iconProps={props}>
                {({ handle }) => (
                  <Menu.Item
                    leadingIcon={RemoveIcon}
                    title="Remove contact"
                    onPress={handle(async () => {
                      if (await confirmRemove()) {
                        router.back();
                        remove();
                      }
                    })}
                  />
                )}
              </AppbarMore>
            ),
          ],
        })}
      />

      <Scrollable>
        <View style={styles.fields}>
          <FormTextField label="Name" name="name" control={control} required />

          <FormTextField
            label="Address"
            placeholder="0x"
            wrap
            name="address"
            control={control}
            required
          />

          <FormChainSelector name="chain" control={control} />
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            onPress={submit}
            requireChanges={!!current}
            control={control}
          >
            {current ? 'Update' : 'Add'}
          </FormSubmitButton>
        </Actions>
      </Scrollable>
    </Pane>
  );
}

const styles = createStyles({
  fields: {
    gap: 16,
    margin: 16,
  },
});

export const SharedContactScreen = withSuspense(ContactScreen_, PaneSkeleton);

const ContactScreenParams = z.object({ address: zUAddress() });

export default function ContactScreen() {
  const { address } = useLocalParams(ContactScreenParams);

  return <SharedContactScreen address={asAddress(address)} chain={asChain(address)} />;
}

export { ErrorBoundary } from '#/ErrorBoundary';
