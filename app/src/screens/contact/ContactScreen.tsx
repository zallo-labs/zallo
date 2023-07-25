import { NetworkIcon, RemoveIcon } from '@theme/icons';
import { Address } from 'lib';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useConfirmRemoval } from '../alert/useConfirm';
import { UserOutlineIcon } from '~/util/theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { SelectChip } from '~/components/fields/SelectChip';
import { CHAIN, SUPPORTED_CHAINS } from '@network/provider';
import { Unimplemented } from '~/util/error/unimplemented';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';
import { gql, useFragment } from '@api/generated';
import { ADDRESS_FIELD_RULES } from '~/util/form.rules';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';

const Fragment = gql(/* GraphQL */ `
  fragment ContactScreen_contact on Contact {
    id
    address
    label
  }
`);

const Query = gql(/* GraphQL */ `
  query Contact($address: Address!) {
    contact(input: { address: $address }) {
      ...ContactScreen_contact
    }
  }
`);

const Upsert = gql(/* GraphQL */ `
  mutation ContactScreen_Upsert($input: UpsertContactInput!) {
    upsertContact(input: $input) {
      ...ContactScreen_contact
    }
  }
`);

const Delete = gql(/* GraphQL */ `
  mutation ContactScreen_Delete($address: Address!) {
    deleteContact(input: { address: $address })
  }
`);

interface Inputs {
  label: string;
  address: Address;
}

export interface ContactScreenParams {
  address?: Address;
}

export type ContactScreenProps = StackNavigatorScreenProps<'Contact'>;

export const ContactScreen = withSuspense(
  ({ route, navigation: { goBack } }: ContactScreenProps) => {
    const { address } = route.params;

    const { data } = useQuery(Query, { address: address! }, { pause: !address });
    const current = useFragment(Fragment, data?.contact);
    const upsert = useMutation(Upsert)[1];
    const remove = useMutation(Delete)[1];
    const confirmRemove = useConfirmRemoval({
      message: 'Are you sure you want to remove this contact',
    });

    const { control, handleSubmit, reset } = useForm<Inputs>({
      defaultValues: { label: current?.label, address: current?.address ?? address },
    });

    const submit = handleSubmit(async ({ label, address }) => {
      await upsert({ input: { label, address, previousAddress: current?.address } });
      goBack();
    });

    return (
      <Screen>
        <Appbar
          mode="large"
          leading="back"
          headline="Contact"
          {...(current && {
            trailing: [
              (props) => <FormResetIcon control={control} reset={reset} {...props} />,
              (props) => (
                <AppbarMore2 iconProps={props}>
                  {({ close }) => (
                    <Menu.Item
                      leadingIcon={RemoveIcon}
                      title="Remove contact"
                      onPress={async () => {
                        close();
                        if (await confirmRemove()) {
                          remove({ address: current.address });
                          goBack();
                        }
                      }}
                    />
                  )}
                </AppbarMore2>
              ),
            ],
          })}
        />

        <View style={styles.fields}>
          <View style={styles.fieldContainer}>
            <UserOutlineIcon style={styles.fieldIcon} size={styles.fieldIcon.width} />
            <FormTextField
              label="Label"
              name="label"
              control={control}
              rules={{ required: true }}
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
              rules={{
                ...ADDRESS_FIELD_RULES,
                required: true,
              }}
              containerStyle={styles.fieldInput}
            />
          </View>

          <View style={[styles.fieldContainer, styles.networkFieldContainer]}>
            <SelectChip
              value={CHAIN.name}
              entries={[
                ...Object.values(SUPPORTED_CHAINS).map(
                  (chain) => [chain.name, chain.name] as const,
                ),
              ]}
              chipProps={{ icon: NetworkIcon, disabled: true }}
              onChange={(name) => {
                throw new Unimplemented('Changing contact address chain');
              }}
            />
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
      </Screen>
    );
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  fields: {
    gap: 16,
    marginHorizontal: 16,
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
