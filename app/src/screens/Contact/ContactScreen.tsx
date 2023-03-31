import { useContact, useDeleteContact, useUpsertContact } from '@api/contacts';
import { NetworkIcon, RemoveIcon } from '@theme/icons';
import { Address, asAddress, isAddressLike, ZERO_ADDR } from 'lib';
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
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { useConfirmRemoval } from '../alert/useConfirm';
import { UserOutlineIcon } from '~/util/theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { SelectField } from '~/components/fields/SelectField';
import { CHAIN, SUPPORTED_CHAINS } from '@network/provider';
import { Unimplemented } from '~/util/error/unimplemented';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';

interface Inputs {
  name: string;
  address: string;
}

export interface ContactScreenParams {
  address?: Address;
}

export type ContactScreenProps = StackNavigatorScreenProps<'Contact'>;

export const ContactScreen = withSuspense(
  ({ route, navigation: { goBack } }: ContactScreenProps) => {
    const { address } = route.params;
    const current = useContact(address);
    const upsertContact = useUpsertContact();
    const removeContact = useDeleteContact();
    const confirmRemove = useConfirmRemoval({
      message: 'Are you sure you want to remove this contact',
    });
    const { control, handleSubmit, reset } = useForm<Inputs>({
      ...(current && { defaultValues: { name: current.name, address: current.address } }),
    });

    const submit = handleSubmit(async ({ name, address }) => {
      await upsertContact({ name, address: asAddress(address) }, current);
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
                      onPress={() => {
                        close();
                        confirmRemove({
                          onConfirm: () => {
                            removeContact(current);
                            goBack();
                          },
                        });
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
              label="Name"
              name="name"
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
                required: true,
                minLength: {
                  value: ZERO_ADDR.length,
                  message: `Must be ${ZERO_ADDR.length} characters`,
                },
                pattern: {
                  value: /^0x/,
                  message: 'Must start with 0x',
                },
                maxLength: {
                  value: ZERO_ADDR.length,
                  message: `Must be ${ZERO_ADDR.length} characters`,
                },
                validate: (v) => isAddressLike(v) || 'Must be a valid address',
              }}
              containerStyle={styles.fieldInput}
            />
          </View>

          <View style={[styles.fieldContainer, styles.networkFieldContainer]}>
            <SelectField
              value={CHAIN.name}
              entries={[
                ...Object.values(SUPPORTED_CHAINS).map(
                  (chain) => [chain.friendlyName, chain.name] as const,
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
