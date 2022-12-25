import { Address } from 'lib';
import { useCreateQuorum } from '~/mutations/quorum/useCreateQuorum.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';

export interface CreateQuorumScreenParams {
  account: Address;
}

export type CreateQuorumScreenProps = RootNavigatorScreenProps<'CreateQuorum'>;

export const CreateQuorumScreen = ({ route }: CreateQuorumScreenProps) => {
  const { account } = route.params;
  const createQuorum = useCreateQuorum(account);

  // TODO: implement

  // TODO: go back on create
  return null;
};
