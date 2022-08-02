import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { Formik } from 'formik';
import { Appbar } from 'react-native-paper';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import * as Yup from 'yup';
import { useCallback } from 'react';
import { FormikTextField } from '@components/fields/FormikTextField';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';
import { CheckIcon } from '@util/theme/icons';
import { useCreateApiSafe } from '~/mutations/safe/useCreateApiSafe';

const initialValues = {
  safeName: '',
  accountName: '',
};

type Values = typeof initialValues;

const schema: Yup.SchemaOf<Values> = Yup.object({
  safeName: Yup.string().required(),
  accountName: Yup.string().required(),
});

export type CreateFirstAccountScreenProps =
  RootNavigatorScreenProps<'CreateFirstAccount'>;

export const CreateFirstAccountScreen = ({
  navigation,
}: CreateFirstAccountScreenProps) => {
  const createSafe = useCreateApiSafe();

  const handleSubmit = useCallback(
    async ({ safeName, accountName }: Values) => {
      await createSafe(safeName, accountName);
      navigation.navigate('BottomNavigator');
    },
    [createSafe, navigation],
  );

  return (
    <Box flex={1}>
      <Appbar.Header mode="medium">
        {/* <Appbar.BackAction onPress={() => navigation.navigate('Register')} /> */}
        <Appbar.Content title="Create Account" />
      </Appbar.Header>

      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        <Container vertical m={4} separator={<Box my={4} />}>
          <FormikTextField name="safeName" label="Safe name" />

          <FormikTextField name="accountName" label="Account name" />

          <FormikSubmitFab icon={CheckIcon} label="Create" />
        </Container>
      </Formik>
    </Box>
  );
};
