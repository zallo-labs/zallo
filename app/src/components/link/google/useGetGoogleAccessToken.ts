import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { fromPromise } from 'neverthrow';

export function useGetGoogleAccessToken() {
  return async (subject: string) => {
    const getAccessToken = async () => {
      await GoogleSignin.signIn({ loginHint: subject });
      const tokens = await GoogleSignin.getTokens();

      return tokens.accessToken;
    };

    return fromPromise(getAccessToken(), (e) => {
      console.error('Error getting Google access token', e);
      return 'failed-to-get-access-token' as const;
    });
  };
}
