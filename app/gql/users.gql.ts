import { gql } from '@apollo/client';

const GET_USER_TEST_QUERY = gql`
  query GetUserTestQuery {
    user2(where: { email: "haydenbriese@gmail.com" }) {
      email
    }
  }
`;
