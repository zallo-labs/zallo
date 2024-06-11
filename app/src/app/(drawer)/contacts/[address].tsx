import { z } from 'zod';
import { zAddress, zChain, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useRouter } from 'expo-router';
import { Address, asAddress, asChain, asUAddress, tryAsUAddress } from 'lib';
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
import { gql, useFragment } from '@api/generated';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
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

const Contact = gql(/* GraphQL */ `
  fragment ContactScreen_Contact on Contact {
    id
    address
    label
  }
`);

const Query = gql(/* GraphQL */ `
  query Contact($address: UAddress!) {
    contact(input: { address: $address }) {
      ...ContactScreen_Contact
    }
  }
`);

const Upsert = gql(/* GraphQL */ `
  mutation ContactScreen_Upsert($input: UpsertContactInput!) {
    upsertContact(input: $input) {
      ...ContactScreen_Contact
    }
  }
`);

const Delete = gql(/* GraphQL */ `
  mutation ContactScreen_Delete($address: UAddress!) {
    deleteContact(input: { address: $address })
  }
`);

const schema = z.object({
  label: z.string().min(1),
  address: zAddress(),
  chain: zChain(),
});

export interface ContactScreenProps {
  address?: Address;
  chain?: Chain;
}

function ContactScreen_(props: ContactScreenProps) {
  const router = useRouter();
  const upsert = useMutation(Upsert)[1];
  const remove = useMutation(Delete)[1];
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this contact',
  });
  const selectedChain = useSelectedChain();

  const existingAddress = tryAsUAddress(props.address, props.chain);
  const { data } = useQuery(Query, { address: existingAddress! }, { pause: !existingAddress });
  const current = useFragment(Contact, data?.contact);

  const { control, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: current?.label,
      address: props.address,
      chain: props.chain ?? selectedChain,
    },
  });

  const submit = handleSubmit(async (input) => {
    const { label, address, chain } = input;
    await upsert({
      input: { label, address: asUAddress(address, chain), previousAddress: current?.address },
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
          <FormTextField label="Label" name="label" control={control} required />

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
