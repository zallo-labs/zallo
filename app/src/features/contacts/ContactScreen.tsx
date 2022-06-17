import { FAB, TextInput, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { address, Address, tryAddress } from 'lib';
import { FormikTextField } from '@components/fields/FormikTextField';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { Contact, useContacts } from '~/queries';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';
import { useUpsertContact } from '~/mutations';
import { ADDR_YUP_SCHEMA } from '@util/yup';
import { Actions } from '@components/Actions';
import { Container } from '@components/list/Container';
import { Box } from '@components/Box';
import { useDeleteContact } from '~/mutations/contact/useDeleteContact';

interface Values {
  addr: string;
  name: string;
}

const name = (k: keyof Values) => k;

const getSchema = (contacts: Contact[]): Yup.SchemaOf<Values> =>
  Yup.object({
    name: Yup.string()
      .required('Required')
      .test({
        message: 'Contact already exists with this name',
        test: (input) => !contacts.find((c) => c.name === input),
      }),
    addr: ADDR_YUP_SCHEMA.test({
      message: 'Contact already exists for this address',
      test: (input) => {
        const addr = tryAddress(input);
        return !contacts.find((c) => c.addr === addr);
      },
    }),
  });

export interface ContactScreenParams {
  addr?: Address;
  name?: string;
}

export type ContactScreenProps = RootNavigatorScreenProps<'Contact'>;

export const ContactScreen = ({
  navigation,
  route: { params },
}: ContactScreenProps) => {
  const { colors } = useTheme();
  const { contacts } = useContacts();
  const upsertContact = useUpsertContact();
  const deleteContact = useDeleteContact();

  const existingContact = params?.addr
    ? contacts.find((c) => c.addr === params.addr)
    : undefined;

  const initialValues: Values = {
    name: existingContact?.name ?? params.name ?? '',
    addr: existingContact?.addr ?? params.addr ?? '',
  };

  const handleSubmit = async (values: Values) => {
    upsertContact(
      {
        name: values.name,
        addr: address(values.addr),
      },
      existingContact,
    );
    navigation.goBack();
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={getSchema(
        contacts.filter((c) => c.addr !== existingContact?.addr),
      )}
    >
      <>
        <Container flex={1} mt={5} mx={3} separator={<Box my={2} />}>
          <FormikTextField
            name={name('name')}
            label="Name"
            placeholder="Vitalik Buterin"
          />

          <FormikTextField
            name={name('addr')}
            label="Address"
            placeholder="0xBae..."
            wrap
            right={
              <TextInput.Icon
                name="line-scan"
                onPress={() =>
                  navigation.navigate('QrScanner', { screen: 'Contact' })
                }
              />
            }
          />
        </Container>

        <Actions>
          {existingContact && (
            <FAB
              icon="delete-forever"
              label="Delete"
              style={{ backgroundColor: colors.delete }}
              onPress={async () => {
                deleteContact(existingContact);
                navigation.goBack();
              }}
            />
          )}

          <FormikSubmitFab
            icon={existingContact ? 'content-save' : 'account-plus'}
            label={existingContact ? 'Save' : 'Create'}
            hideWhenClean={!!existingContact}
          />
        </Actions>
      </>
    </Formik>
  );
};
