import { gql, useQuery } from '@apollo/client';
import { GetUserTestQuery } from './types/GetUserTestQuery';

const GET_USER_TEST_QUERY = gql`
  query GetUserTestQuery {
    user2(where: { email: "haydenbriese@gmail.com" }) {
      email
    }
  }
`;

export const useGetUserTestQuery = () => {
  const { data, ...rest } = useQuery<GetUserTestQuery>(GET_USER_TEST_QUERY);
  return { user: data?.user2, ...rest };
};
