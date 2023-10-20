import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { asAddress } from 'lib';
import { View } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { TextInput } from 'react-native-paper';
import { Button } from '~/components/Button';
import { QrCodeIcon } from '@theme/icons';
import { gql } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { NotFound } from '~/components/NotFound';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { getDeviceModel } from '~/lib/device';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

const Query = gql(/* GraphQL */ `
  query ApproverDetails($approver: Address) {
    approver(input: { address: $approver }) {
      id
      address
      name
    }

    user {
      id
      name
      approvers {
        id
        name
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation ApproverScreen_update($approver: Address!, $name: String!) {
    updateApprover(input: { address: $approver, name: $name }) {
      id
      name
      label
    }
  }
`);

interface Inputs {
  name: string;
}

export type ApproverScreenRoute = `/(drawer)/approver/[address]/`;
export type ApproverScreenParams = SearchParams<ApproverScreenRoute>;

function ApproverScreen() {
  const params = useLocalSearchParams<ApproverScreenParams>();
  const router = useRouter();
  const update = useMutation(Update)[1];

  const query = useQuery(Query, { approver: asAddress(params.address) });
  const { approver, user } = query.data;

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { name: approver?.name ?? getDeviceModel() },
  });

  if (!approver) return query.stale ? null : <NotFound name="Approver" />;

  const takenNames = user.approvers.filter((a) => a.id !== approver.id).map((a) => a.name);

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" headline="Approver" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          left={user.name ? <TextInput.Affix text={`${user.name}'s`} /> : undefined}
          label="Label"
          placeholder="iPhone"
          containerStyle={styles.inset}
          rules={{
            required: true,
            validate: (v) => !takenNames.includes(v) || 'An approver with ths name already exists',
          }}
          onBlur={handleSubmit(async ({ name }) => {
            await update({ approver: approver.address, name });
          })}
        />
      </View>

      <Actions>
        <Button
          mode="contained"
          icon={QrCodeIcon}
          onPress={() =>
            router.push({
              pathname: `/approver/[address]/qr`,
              params: { address: approver.address },
            })
          }
        >
          View
        </Button>
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fields: {
    marginVertical: 16,
    gap: 16,
  },
  inset: {
    marginHorizontal: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});

export default withSuspense(ApproverScreen, ScreenSkeleton);
