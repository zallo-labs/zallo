import { Address } from 'lib';
import { useCreateQuorum } from '~/mutations/quorum/useCreateQuorum.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface CreateQuorumScreenParams {
  account: Address;
}

export type CreateQuorumScreenProps = StackNavigatorScreenProps<'CreateQuorum'>;

export const CreateQuorumScreen = ({ route }: CreateQuorumScreenProps) => {
  const { account } = route.params;
  const createQuorum = useCreateQuorum(account);

  // TODO: implement

  // TODO: go back on create
  return null;
};
