import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { NextIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Formik } from 'formik';
import { Appbar, Text } from 'react-native-paper';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useName, useSetName } from './useName';
import * as Yup from 'yup';
import { FormikTextField } from '@components/fields/FormikTextField';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';

interface Values {
  name: string;
}

const schema: Yup.SchemaOf<Values> = Yup.object({
  name: Yup.string().required('Required'),
});

export const useShowNameScreen = () => useName().length === 0;

export type NameScreenProps = RootNavigatorScreenProps<'Name'>;

export const NameScreen = ({ navigation }: NameScreenProps) => {
  const styles = useStyles();
  const name = useName();
  const setName = useSetName();

  const handleSubmit = ({ name }: Values) => {
    setName(name);
    navigation.navigate('CreateWallet');
  };

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
      </Appbar.Header>

      <Formik
        initialValues={{ name }}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        <>
          <Box mx={4}>
            <Text style={styles.input}>What should we call you?</Text>

            <FormikTextField name="name" label="Name" />
          </Box>

          <FormikSubmitFab icon={NextIcon} label="Continue" />
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
