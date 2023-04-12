import { Box } from '~/components/layout/Box';
import { Formik, FormikHelpers } from 'formik';
import { Address, isAddress } from 'lib';
import { Button } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Contact, useContacts, useContact, useUpsertContact } from '@api/contacts';
import * as Yup from 'yup';
import { FormikTextField } from '~/components/fields/FormikTextField';
import { ScanIcon } from '~/util/theme/icons';
import assert from 'assert';
import { useMemo } from 'react';
import { ContactAppbar } from './ContactAppbar';
import { useScanAddress } from '../Scan/ScanScreen';
import { FormikSubmitActionButton } from '~/components/fields/FormikSubmitActionButton';
import { StyleSheet } from 'react-native';

const defaultValues = {
  name: '',
  address: '',
};

type Values = typeof defaultValues;

export const ADDR_YUP_SCHEMA = Yup.string().required('Required').test({
  message: 'Must be a valid address',
  test: isAddress,
});

const getSchema = (contacts: Contact[], existing?: Contact): Yup.SchemaOf<Values> =>
  Yup.object({
    name: Yup.string()
      .required('Required')
      .test({
        message: 'Contact already exists with this name',
        test: (name) => existing?.name === name || !contacts.find((c) => c.name === name),
      }),
    address: ADDR_YUP_SCHEMA.test({
      message: 'Contact already exists for this address',
      test: (address) =>
        existing?.address === address || !contacts.find((c) => c.address === address),
    }),
  });

export interface ContactScreenParams {
  address?: Address;
}

export type ContactScreenProps = StackNavigatorScreenProps<'Contact'>;

export const ContactScreen = ({ route, navigation: { goBack, setParams } }: ContactScreenProps) => {
  const contacts = useContacts();
  const existing = useContact(route.params.address);
  const upsert = useUpsertContact();
  const scanAddress = useScanAddress();

  const handleSubmit = async (values: Values, helpers: FormikHelpers<Values>) => {
    assert(isAddress(values.address)); // Enforced by schema
    await upsert(
      {
        name: values.name,
        address: values.address,
      },
      existing,
    );
    setParams({ address: values.address });
  };

  return (
    <Box flex={1}>
      <ContactAppbar existing={existing} />

      <Formik
        initialValues={existing ?? defaultValues}
        onSubmit={handleSubmit}
        validationSchema={useMemo(() => getSchema(contacts, existing), [contacts, existing])}
        enableReinitialize
      >
        {({ setFieldValue, isSubmitting }) => (
          <>
            <Box style={styles.fieldsContainer}>
              <FormikTextField name="name" label="Name" />

              <FormikTextField
                name="addr"
                label="Address"
                multiline
                blurOnSubmit
                containerStyle={styles.addressField}
              />

              <Button
                icon={ScanIcon}
                mode="contained-tonal"
                style={styles.scanButton}
                disabled={isSubmitting}
                onPress={async () => {
                  setFieldValue('addr', await scanAddress({}));
                  goBack();
                }}
              >
                Scan
              </Button>
            </Box>

            <FormikSubmitActionButton disableWhenClean={!!existing}>
              {existing ? 'Save' : 'Create'}
            </FormikSubmitActionButton>
          </>
        )}
      </Formik>
    </Box>
  );
};

const styles = StyleSheet.create({
  fieldsContainer: {
    marginHorizontal: 16,
  },
  addressField: {
    marginTop: 16,
    marginBottom: 8,
  },
  scanButton: {
    alignSelf: 'flex-end',
  },
  actionButton: {
    margin: 16,
  },
});
