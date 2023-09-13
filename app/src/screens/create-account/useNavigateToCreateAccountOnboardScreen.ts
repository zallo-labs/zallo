import { gql } from '@api';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query CreateAccountScreen {
    accounts {
      id
      address
    }
  }
`);

export function useNavigateToCreateAccountOnboardScreen() {
  const { navigate } = useNavigation();
  const accounts = useQuery(Query).data.accounts;

  return async () => {
    return accounts?.length
      ? navigate('Home', { account: accounts[0].address })
      : navigate('CreateAccount', {});
  };
}
