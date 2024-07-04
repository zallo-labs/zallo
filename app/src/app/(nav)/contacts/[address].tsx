import { z } from 'zod';
import { zAddress, zChain, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useRouter } from 'expo-router';
import { Address, ZERO_ADDR, asAddress, asChain, asUAddress, tryAsUAddress } from 'lib';
import { RemoveIcon } from '@theme/icons';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { FormResetIcon } from '#/fields/ResetFormIcon';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { Chain } from 'chains';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelectedChain } from '~/hooks/useSelectedAccount';
import { Appbar } from '#/Appbar/Appbar';
import { Pane } from '#/layout/Pane';
import { FormChainSelector } from '#/fields/FormChainSelector';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { Address_ContactScreen_upsertMutation } from '~/api/__generated__/Address_ContactScreen_upsertMutation.graphql';
import { Address_ContactScreen_deleteMutation } from '~/api/__generated__/Address_ContactScreen_deleteMutation.graphql';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { Address_ContactScreenQuery } from '~/api/__generated__/Address_ContactScreenQuery.graphql';
import { Address_ContactScreen_contact$key } from '~/api/__generated__/Address_ContactScreen_contact.graphql';

const Contact = graphql`
  fragment Address_ContactScreen_contact on Contact {
    id
    address
    name
  }
`;

const Query = graphql`
  query Address_ContactScreenQuery($address: UAddress!, $include: Boolean!) {
    contact(input: { address: $address }) @include(if: $include) {
      ...Address_ContactScreen_contact
    }
  }
`;

const Upsert = graphql`
  mutation Address_ContactScreen_upsertMutation($input: UpsertContactInput!) {
    upsertContact(input: $input) {
      ...Address_ContactScreen_contact
    }
  }
`;

const Delete = graphql`
  mutation Address_ContactScreen_deleteMutation($address: UAddress!) {
    deleteContact(input: { address: $address }) @deleteRecord
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
  const upsert = useMutation<Address_ContactScreen_upsertMutation>(Upsert);
  const remove = useMutation<Address_ContactScreen_deleteMutation>(Delete);
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this contact',
  });
  const selectedChain = useSelectedChain();

  const existingAddress = tryAsUAddress(props.address, props.chain);
  const data = useLazyLoadQuery<Address_ContactScreenQuery>(Query, {
    address: existingAddress ?? `zksync:${ZERO_ADDR}`,
    include: !!existingAddress,
  });
  const current = useFragment<Address_ContactScreen_contact$key>(Contact, data?.contact);

  const { control, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: current?.name,
      address: props.address,
      chain: props.chain ?? selectedChain,
    },
  });

  const submit = handleSubmit(async (input) => {
    const { name, address, chain } = input;
    await upsert({
      input: { name, address: asUAddress(address, chain), previousAddress: current?.address },
    });
    router.back();
    reset(input);
  });

  return (
    <Pane flex>
      <Appbar
        mode="small"
        headline="Contact"
        {...(current && {
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
                        remove({ address: current.address });
                        router.back();
                      }
                    })}
                  />
                )}
              </AppbarMore>
            ),
          ],
        })}
      />

      <ScrollableScreenSurface>
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
      </ScrollableScreenSurface>
    </Pane>
  );
}

const styles = StyleSheet.create({
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
