import { Box } from '~/components/layout/Box';
import { Formik, FormikHelpers } from 'formik';
import { Address, isAddress } from 'lib';
import { Button } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useContact } from '~/queries/contacts/useContact';
import * as Yup from 'yup';
import { FormikTextField } from '~/components/fields/FormikTextField';
import { ScanIcon } from '~/util/theme/icons';
import { useUpsertContact } from '~/mutations/contact/useUpsertContact.api';
import assert from 'assert';
import { Contact, useContacts } from '~/queries/contacts/useContacts.api';
import { useMemo } from 'react';
import { ContactAppbar } from './ContactAppbar';
import { useScanAddr } from '../scan/useScanAddr';
import { makeStyles } from '@theme/makeStyles';
import { FormikSubmitActionButton } from '~/components/fields/FormikSubmitActionButton';

const defaultValues = {
  name: '',
  addr: '',
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
    addr: ADDR_YUP_SCHEMA.test({
      message: 'Contact already exists for this address',
      test: (addr) => existing?.addr === addr || !contacts.find((c) => c.addr === addr),
    }),
  });

export interface ContactScreenParams {
  addr?: Address;
}

export type ContactScreenProps = StackNavigatorScreenProps<'Contact'>;

export const ContactScreen = ({ route, navigation: { goBack } }: ContactScreenProps) => {
  const styles = useStyles();
  const contacts = useContacts();
  const existing = useContact(route.params.addr);
  const upsert = useUpsertContact();
  const scanAddr = useScanAddr();

  const handleSubmit = async (values: Values, helpers: FormikHelpers<Values>) => {
    assert(isAddress(values.addr)); // Enforced by schema
    await upsert(
      {
        name: values.name,
        addr: values.addr,
      },
      existing,
    );
    helpers.setSubmitting(false);
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
                  setFieldValue('addr', (await scanAddr()).target_address);
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

const useStyles = makeStyles(({ s }) => ({
  fieldsContainer: {
    marginHorizontal: s(16),
  },
  addressField: {
    marginTop: s(16),
    marginBottom: s(8),
  },
  scanButton: {
    alignSelf: 'flex-end',
  },
  actionButton: {
    margin: s(16),
  },
}));
