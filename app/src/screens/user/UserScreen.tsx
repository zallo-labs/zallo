import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';
import { Button } from 'react-native-paper';
import { PairIcon } from '../pair-confirm/PairConfirmSheet';
import { ListHeader } from '~/components/list/ListHeader';
import { UserApproverItem } from './UserApproverItem';
import { gql } from '@api/gen';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';

const Query = gql(/* GraphQL */ `
  query UserScreen {
    user {
      id
      name

      approvers {
        id
        ...UserApproverItem_UserApproverFragment
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation UserScreen_Update($name: String!) {
    updateUser(input: { name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export type UserScreenProps = StackNavigatorScreenProps<'User'>;

export const UserScreen = ({ navigation: { navigate } }: UserScreenProps) => {
  const { user } = useQuery(Query).data;
  const update = useMutation(Update)[1];

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: user.name ?? '' },
  });

  return (
    <Screen>
      <Appbar
        mode="large"
        leading="back"
        headline="User"
        trailing={(props) => <FormResetIcon control={control} reset={reset} {...props} />}
      />

      <FormTextField
        label="Name"
        supporting="Only visible by account members"
        name="name"
        placeholder="Alisha"
        control={control}
        rules={{ required: true }}
        containerStyle={styles.nameContainer}
        onEndEditing={handleSubmit(async ({ name }) => {
          await update({ name });
        })}
      />

      <View>
        <ListHeader>Approvers</ListHeader>

        {user.approvers.map((approver) => (
          <UserApproverItem key={approver.id} approver={approver} />
        ))}
      </View>

      <Actions>
        <Button
          mode="contained-tonal"
          icon={PairIcon}
          onPress={() => navigate('PairUserModal', {})}
        >
          Pair with existing user
        </Button>
      </Actions>
    </Screen>
  );
};

const styles = StyleSheet.create({
  nameContainer: {
    margin: 16,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
