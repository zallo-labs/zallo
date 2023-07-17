import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';
import { useSuspenseQuery } from '@apollo/client';
import { UserQueryVariables, useUserUpdateMutation } from '@api/generated';
import { Button } from 'react-native-paper';
import { PairIcon } from '../pair-confirm/PairConfirmSheet';
import { ListHeader } from '~/components/list/ListHeader';
import { UserApproverItem } from './UserApproverItem';
import { gql } from '@api/gen';
import { UserQuery } from '@api/gen/graphql';

const UserDocument = gql(/* GraphQL */ `
  query User {
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

gql(/* GraphQL */ `
  mutation UserUpdate($name: String!) {
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
  const [update] = useUserUpdateMutation();
  const { user } = useSuspenseQuery<UserQuery, UserQueryVariables>(UserDocument).data;

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
          await update({ variables: { name } });
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
