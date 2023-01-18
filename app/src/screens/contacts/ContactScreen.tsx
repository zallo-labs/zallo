import { Box } from '~/components/layout/Box';
import { Formik } from 'formik';
import { Address, isAddress } from 'lib';
import { Button } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useContact } from '~/queries/contacts/useContact';
import * as Yup from 'yup';
import { FormikTextField } from '~/components/fields/FormikTextField';
import { CheckIcon, ScanIcon } from '~/util/theme/icons';
import { useUpsertContact } from '~/mutations/contact/useUpsertContact.api';
import assert from 'assert';
import { FormikSubmitFab } from '~/components/fields/FormikSubmitFab';
import { StyleSheet } from 'react-native';
import { Contact, useContacts } from '~/queries/contacts/useContacts.api';
import { useCallback, useMemo } from 'react';
import { ContactAppbar } from './ContactAppbar';
import { useScanAddr } from '../scan/useScanAddr';

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

export const ContactScreen = ({ route, navigation }: ContactScreenProps) => {
  const [contacts] = useContacts();
  const existing = useContact(route.params.addr);
  const upsert = useUpsertContact();
  const scanAddr = useScanAddr();

  const handleSubmit = useCallback(
    async (values: Values) => {
      assert(isAddress(values.addr)); // Enforced by schema
      await upsert(
        {
          name: values.name,
          addr: values.addr,
        },
        existing,
      );
      navigation.goBack();
    },
    [existing, navigation, upsert],
  );

  return (
    <Box flex={1}>
      <ContactAppbar existing={existing} />

      <Formik
        initialValues={existing ?? defaultValues}
        onSubmit={handleSubmit}
        validationSchema={useMemo(() => getSchema(contacts, existing), [contacts, existing])}
      >
        {({ setFieldValue }) => (
          <>
            <Box mx={2}>
              <FormikTextField name="name" label="Name" />

              <Box mt={3} mb={2}>
                <FormikTextField name="addr" label="Address" multiline blurOnSubmit />
              </Box>

              <Button
                icon={ScanIcon}
                mode="contained-tonal"
                style={styles.scan}
                onPress={async () => {
                  setFieldValue('addr', (await scanAddr()).target_address);
                  navigation.goBack();
                }}
              >
                Scan
              </Button>
            </Box>

            <FormikSubmitFab
              icon={CheckIcon}
              label={existing ? 'Save' : 'Create'}
              hideWhenClean={!!existing}
            />
          </>
        )}
      </Formik>
    </Box>
  );
};

const styles = StyleSheet.create({
  scan: {
    alignSelf: 'flex-end',
  },
});
