import { gql } from '@apollo/client';
import { useCallback } from 'react';
import { useRegisterPushTokenMutation } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';

gql`
  mutation RegisterPushToken($token: String!) {
    registerPushToken(token: $token)
  }
`;

export const useRegisterPushToken = () => {
  const [register] = useRegisterPushTokenMutation({
    client: useApiClient(),
  });

  return useCallback((token: string) => register({ variables: { token } }), [register]);
};
