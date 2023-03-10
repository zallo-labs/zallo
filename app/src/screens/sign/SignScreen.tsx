import { useApprover } from '@network/useApprover';
import { Address, toAccountSignature } from 'lib';
import { match } from 'ts-pattern';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { WcErrorKey } from '~/util/walletconnect/jsonRcp';
import { BytesLike, hexlify } from 'ethers/lib/utils';
import { Appbar, Button, Text } from 'react-native-paper';
import {
  toTypedData,
  Eip712TypedDomainData,
  SigningRequest,
} from '~/util/walletconnect/methods/signing';
import { ProposerDetails } from '../session-proposal/ProposerDetails';
import { CHAIN_ID } from '@network/provider';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import useAsyncEffect from 'use-async-effect';
import { showWarning } from '~/provider/SnackbarProvider';
import { Eip712TypedData } from './Eip712TypedData';
import { Topic, useSession } from '~/util/walletconnect/useTopic';
import { Box } from '~/components/layout/Box';
import { Actions } from '~/components/layout/Actions';
import { Addr } from '~/components/addr/Addr';
import { makeStyles } from '@theme/makeStyles';
import { useSessonAccountQuorum } from '../session-proposal/useSessionAccountQuorum';

interface SigningError {
  error: WcErrorKey;
}

const isSigningError = (v: unknown): v is SigningError =>
  typeof v === 'object' && v !== null && 'error' in v;

export interface SignScreenParams {
  topic: Topic;
  id: number;
  request: SigningRequest;
}

export type SignScreenProps = StackNavigatorScreenProps<'Sign'>;

export const SignScreen = ({ navigation, route }: SignScreenProps) => {
  const { id, request } = route.params;
  const styles = useStyles();
  const approver = useApprover();
  const topic = useSession(route.params.topic);

  const [account, data] = useMemo(
    () =>
      match<SigningRequest, [Address, string | Eip712TypedDomainData]>(request)
        .with({ method: 'personal_sign' }, ({ params: [message, account] }) => [account, message])
        .with({ method: 'eth_sign' }, ({ params }) => params)
        .with(
          { method: 'eth_signTypedData' },
          { method: 'eth_signTypedData_v3' },
          { method: 'eth_signTypedData_v4' },
          ({ params: [account, typedDataJson] }) => [account, toTypedData(typedDataJson)],
        )
        .exhaustive(),
    [request],
  );

  const reject = useCallback(
    (error: WcErrorKey) => {
      topic.reject(id, error);
      navigation.goBack();
    },
    [id, navigation, topic],
  );

  const quorum = useSessonAccountQuorum(id, account)?.active;

  const promisedAccountSignature = useMemo(async (): Promise<BytesLike | { error: WcErrorKey }> => {
    // const toAccSig = (signature: BytesLike) => toAccountSignature(quorum, [{ approver: credentials.address, signature }]);

    const ownSignature = await match(data)
      .when(
        (data): data is string => typeof data === 'string',
        (message) => approver.signMessage(message),
      )
      .when(
        (data): data is Eip712TypedDomainData => typeof data === 'object',
        (typedData) => {
          // Ensure signing domain chain matches
          if (
            typedData.domain.chainId !== undefined &&
            !BigNumber.from(typedData.domain.chainId).eq(CHAIN_ID())
          )
            return { error: 'UNSUPPORTED_CHAINS' } as const;

          return approver._signTypedData(typedData.domain, typedData.types, typedData.message);
        },
      )
      .exhaustive();

    if (!quorum) return { error: 'UNSUPPORTED_ACCOUNTS' };

    return isSigningError(ownSignature)
      ? ownSignature
      : toAccountSignature(quorum, [{ approver: approver.address, signature: ownSignature }]);
  }, [data, quorum, approver]);

  const validateSignature = useCallback(
    (signature: BytesLike | SigningError): signature is BytesLike => {
      if (isSigningError(signature)) {
        showWarning('Invalid signing request was rejected');
        reject(signature.error);
        return false;
      }
      return true;
    },
    [reject],
  );

  useAsyncEffect(
    async (isMounted) => {
      const signature = await promisedAccountSignature;
      if (isMounted()) validateSignature(signature);
    },
    [promisedAccountSignature],
  );

  const sign = async () => {
    const signature = await promisedAccountSignature;
    if (validateSignature(signature)) {
      topic.respond(id, hexlify(signature));
      navigation.goBack();
    }
  };

  return (
    <Box flex={1}>
      <Appbar.Header>
        <Appbar.Content title="Signing Request" />
      </Appbar.Header>

      <Box flex={1} mx={2}>
        <ProposerDetails proposer={topic.proposer} />

        <Text variant="headlineSmall" style={styles.signTitle}>
          {'Wants '}
          <Text variant="headlineSmall" style={styles.accountName}>
            <Addr addr={account} />
          </Text>
          {' to sign'}
        </Text>
        <Eip712TypedData data={data} />
      </Box>

      <Actions
        primary={
          <Button mode="contained" onPress={sign}>
            Sign
          </Button>
        }
        secondary={<Button onPress={() => reject('USER_REJECTED')}>Reject</Button>}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ colors, space }) => ({
  signTitle: {
    marginTop: space(3),
    marginBottom: space(2),
  },
  accountName: {
    color: colors.primary,
  },
}));
