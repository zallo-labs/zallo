import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useMutation } from 'urql';
import { z } from 'zod';

import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { Button } from '~/components/Button';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { NotFound } from '~/components/NotFound';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zAddress } from '~/lib/zod';
import { QrCodeIcon } from '~/util/theme/icons';

const Query = gql(/* GraphQL */ `
  query ApproverScreen($approver: Address) {
    approver(input: { address: $approver }) {
      id
      address
      name
    }

    user {
      id
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

const ApproverScreenParams = z.object({ address: zAddress() });

function ApproverScreen() {
  const params = useLocalParams(ApproverScreenParams);
  const router = useRouter();
  const update = useMutation(Update)[1];

  const query = useQuery(Query, { approver: params.address });
  const { approver, user } = query.data;

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: approver?.name ?? '' },
  });

  useEffect(() => {
    if (approver?.name) reset({ name: approver.name });
  }, [reset, approver?.name]);

  if (!approver) return query.stale ? null : <NotFound name="Approver" />;

  const takenNames = user.approvers.filter((a) => a.id !== approver.id).map((a) => a.name);

  return (
    <>
      <AppbarOptions mode="large" headline="Approver" />

      <ScreenSurface>
        <View style={styles.fields}>
          <FormTextField
            name="name"
            control={control}
            label="Label"
            placeholder="iPhone"
            containerStyle={styles.inset}
            rules={{
              required: true,
              validate: (v) =>
                !takenNames.includes(v) || 'An approver with ths name already exists',
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
                pathname: `/approvers/[address]/qr`,
                params: { address: approver.address },
              })
            }
          >
            View
          </Button>
        </Actions>
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    marginVertical: 16,
    gap: 16,
  },
  inset: {
    marginHorizontal: 16,
  },
});

export default withSuspense(ApproverScreen, <ScreenSkeleton />);
