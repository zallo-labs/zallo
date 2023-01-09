import { Box } from '~/components/layout/Box';
import { Formik } from 'formik';
import { Appbar, Text } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import * as Yup from 'yup';
import { useCallback } from 'react';
import { FormikTextField } from '~/components/fields/FormikTextField';
import { FormikSubmitFab } from '~/components/fields/FormikSubmitFab';
import { CheckIcon } from '~/util/theme/icons';
import { CreateAccountResult, useCreateAccount } from '~/mutations/account/useCreateAccount.api';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { makeStyles } from '~/util/theme/makeStyles';
import { RootNavigation, useRootNavigation } from '~/navigation/useRootNavigation';

interface Values {
  name: string;
}

const schema: Yup.SchemaOf<Values> = Yup.object({
  name: Yup.string().required('Required'),
});

export interface CreateAccountScreenParams {
  onCreate?: (res: CreateAccountResult, navigation: RootNavigation) => void;
}

export type CreateAccountScreenProps = StackNavigatorScreenProps<'CreateAccount'>;

export const CreateAccountScreen = ({ route }: CreateAccountScreenProps) => {
  const styles = useStyles();
  const createAccount = useCreateAccount();
  const navigation = useRootNavigation();

  const handleSubmit = useCallback(
    async ({ name }: Values) => {
      const r = await createAccount(name);
      if (route.params.onCreate) {
        route.params.onCreate(r, navigation);
      } else {
        navigation.navigate('Account', { account: r.account });
      }
    },
    [createAccount, navigation, route.params],
  );

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
      </Appbar.Header>

      <Formik initialValues={{ name: '' }} onSubmit={handleSubmit} validationSchema={schema}>
        <>
          <Box mx={4}>
            <Text style={styles.input}>What should we call your account?</Text>

            <FormikTextField name="name" label="Account name" />
          </Box>

          <FormikSubmitFab icon={CheckIcon} label="Create" />
        </>
      </Formik>
    </Box>
  );
};

const useStyles = makeStyles(({ space, fonts }) => ({
  input: {
    ...fonts.headlineLarge,
    textAlign: 'center',
    marginVertical: space(4),
  },
}));
