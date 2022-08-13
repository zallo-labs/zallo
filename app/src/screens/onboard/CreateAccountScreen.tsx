import { Box } from '@components/Box';
import { Formik } from 'formik';
import { Appbar, Text } from 'react-native-paper';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import * as Yup from 'yup';
import { useCallback } from 'react';
import { FormikTextField } from '@components/fields/FormikTextField';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';
import { CheckIcon } from '@util/theme/icons';
import { useCreateApiAccount } from '~/mutations/account/useCreateAccount.api';
import { AppbarBack } from '@components/AppbarBack';
import { makeStyles } from '@util/theme/makeStyles';
import { useName } from './Name/useName';
import { Navigate } from '~/navigation';
import { address, Address } from 'lib';

interface Values {
  name: string;
}

const schema: Yup.SchemaOf<Values> = Yup.object({
  name: Yup.string().required('Required'),
});

export interface CreateAccountScreenParams {
  navigate: (account: Address, navigate: Navigate) => void;
}

export type CreateAccountScreenProps =
  RootNavigatorScreenProps<'CreateAccount'>;

export const CreateAccountScreen = ({
  navigation,
  route,
}: CreateAccountScreenProps) => {
  const styles = useStyles();
  const createAccount = useCreateApiAccount();
  const name = useName();

  const handleSubmit = useCallback(
    async ({ name }: Values) => {
      const res = await createAccount(name, 'Spending');
      const account = address(res.data!.createAccount.id);

      route.params.navigate(account, navigation.navigate);
    },
    [createAccount, navigation.navigate, route.params],
  );

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
      </Appbar.Header>

      <Formik
        initialValues={{ name: `${name}'s Account` }}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        <>
          <Box mx={4}>
            <Text style={styles.input}>Create Account</Text>

            <FormikTextField name="name" label="Name" />
          </Box>

          <FormikSubmitFab icon={CheckIcon} label="Create" />
        </>
      </Formik>
    </Box>
  );
};

const useStyles = makeStyles(({ space, typescale }) => ({
  input: {
    ...typescale.headlineLarge,
    textAlign: 'center',
    marginTop: space(5),
    marginBottom: space(4),
  },
}));
