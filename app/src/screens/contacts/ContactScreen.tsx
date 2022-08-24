import { Box } from '~/components/layout/Box';
import { Formik } from 'formik';
import { Address, isAddress } from 'lib';
import { Button } from 'react-native-paper';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
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

const defaultValues = {
  name: '',
  addr: '',
};

type Values = typeof defaultValues;

export const ADDR_YUP_SCHEMA = Yup.string().required('Required').test({
  message: 'Must be a valid address',
  test: isAddress,
});

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
      test: (input) =>
        !isAddress(input) || !contacts.find((c) => c.addr === input),
    }),
  });

export interface ContactScreenParams {
  addr?: Address;
}

export type ContactScreenProps = RootNavigatorScreenProps<'Contact'>;

export const ContactScreen = ({ route, navigation }: ContactScreenProps) => {
  const { contacts } = useContacts();
  const existing = useContact(route.params.addr);
  const upsert = useUpsertContact();

  const schema = useMemo(() => getSchema(contacts), [contacts]);

  const handleSubmit = useCallback(
    async (values: Values) => {
      assert(isAddress(values.addr)); // Enforced by schema
      upsert(
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
        validationSchema={schema}
      >
        {({ setFieldValue }) => (
          <>
            <Box m={4}>
              <FormikTextField name="name" label="Name" />

              <Box mt={3} mb={2}>
                <FormikTextField
                  name="addr"
                  label="Address"
                  multiline
                  blurOnSubmit
                />
              </Box>

              <Button
                icon={ScanIcon}
                mode="contained-tonal"
                style={styles.scan}
                onPress={() =>
                  navigation.navigate('Scan', {
                    onScan: (link) =>
                      setFieldValue('addr', link.target_address),
                  })
                }
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
