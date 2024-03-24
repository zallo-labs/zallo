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
import { UserOutlineIcon } from '~/util/theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { FormResetIcon } from '#/fields/ResetFormIcon';
import { gql, useFragment } from '@api/generated';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { Chain } from 'chains';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelectedChain } from '~/hooks/useSelectedAccount';
import { FormSelectChip } from '#/fields/FormSelectChip';
import { CHAIN_ENTRIES } from '@network/chains';

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
    <>
      <AppbarOptions
        mode="large"
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
          <View style={styles.fieldContainer}>
            <UserOutlineIcon style={styles.fieldIcon} size={styles.fieldIcon.width} />
            <FormTextField
              label="Label"
              name="label"
              control={control}
              required
              containerStyle={styles.fieldInput}
            />
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon} />
            <FormTextField
              label="Address"
              placeholder="0x"
              wrap
              name="address"
              control={control}
              required
              containerStyle={styles.fieldInput}
            />
          </View>

          <View style={[styles.fieldContainer, styles.networkFieldContainer]}>
            <FormSelectChip name="chain" control={control} entries={CHAIN_ENTRIES} />
          </View>
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            onPress={submit}
            requireChanges={!!current}
            control={control}
            style={styles.action}
          >
            {current ? 'Update' : 'Add'}
          </FormSubmitButton>
        </Actions>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
    margin: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldIcon: {
    marginTop: 16,
    width: ICON_SIZE.small,
  },
  fieldInput: {
    flex: 1,
  },
  networkFieldContainer: {
    justifyContent: 'flex-end',
  },
  action: {
    alignSelf: 'stretch',
  },
});

export const SharedContactScreen = withSuspense(ContactScreen_, ScreenSkeleton);

const ContactScreenParams = z.object({ address: zUAddress() });

export default function ContactScreen() {
  const { address } = useLocalParams(ContactScreenParams);

  return <SharedContactScreen address={asAddress(address)} chain={asChain(address)} />;
}

export { ErrorBoundary } from '#/ErrorBoundary';
