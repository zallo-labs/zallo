import { FAB, TextInput, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { address, Address, tryAddress } from 'lib';
import { FormikTextField } from '@components/fields/FormikTextField';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';
import { ADDR_YUP_SCHEMA } from '@util/yup';
import { Actions } from '@components/Actions';
import { Container } from '@components/list/Container';
import { Box } from '@components/Box';
import { ScanIcon } from '@util/icons';
import { Contact, useContacts } from '~/queries/useContacts.api';
import { useDeleteContact } from '~/mutations/contact/useDeleteContact.api';
import { useUpsertContact } from '~/mutations/contact/useUpsertContact.api';

interface Values {
  addr: string;
  name: string;
}

const field = (k: keyof Values) => k;

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
        const addr = input && tryAddress(input);
        return !addr || !contacts.find((c) => c.addr === addr);
      },
    }),
  });

export interface ContactScreenParams {
  addr?: Address;
  name?: string;
}

export type ContactScreenProps = RootNavigatorScreenProps<'Contact'>;

export const ContactScreen = ({ navigation, route }: ContactScreenProps) => {
  const { addr, name } = route.params ?? {};
  const { colors } = useTheme();
  const { contacts } = useContacts();
  const upsertContact = useUpsertContact();
  const deleteContact = useDeleteContact();

  const existingContact = addr
    ? contacts.find((c) => c.addr === addr)
    : undefined;

  const initialValues: Values = {
    name: existingContact?.name ?? name ?? '',
    addr: existingContact?.addr ?? addr ?? '',
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
            name={field('name')}
            label="Name"
            placeholder="Vitalik Buterin"
          />

          <FormikTextField
            name={field('addr')}
            label="Address"
            placeholder="0xBae..."
            wrap
            textAlignVertical="center"
            right={
              <TextInput.Icon
                name={ScanIcon}
                onPress={() =>
                  navigation.navigate('QrScanner', {
                    target: { route: 'Contact', output: 'addr' },
                  })
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
