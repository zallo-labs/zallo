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

interface Values {
  name: string;
}

const schema: Yup.SchemaOf<Values> = Yup.object({
  name: Yup.string().required('Required'),
});

export type CreateWalletScreenProps = RootNavigatorScreenProps<'CreateWallet'>;

export const CreateWalletScreen = ({ navigation }: CreateWalletScreenProps) => {
  const styles = useStyles();
  const createAccount = useCreateApiAccount();
  const name = useName();

  const handleSubmit = useCallback(
    async ({ name }: Values) => {
      await createAccount(name, 'Spending');
      navigation.navigate('BottomNavigator');
    },
    [createAccount, navigation],
  );

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
      </Appbar.Header>

      <Formik
        initialValues={{ name: `${name}'s Wallet` }}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        <>
          <Box mx={4}>
            <Text style={styles.input}>Create wallet</Text>

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
