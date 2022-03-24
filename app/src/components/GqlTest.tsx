import { Text } from 'react-native';
import { useGetUserTestQuery } from '../gql';

export default () => {
  const { user } = useGetUserTestQuery();

  return <Text>User email: {user?.email}</Text>;
};
