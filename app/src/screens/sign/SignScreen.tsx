import { useDevice } from '@network/useDevice';
import { Address, createUserSignature } from 'lib';
import { match } from 'ts-pattern';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WcErrorKey } from '~/util/walletconnect/jsonRcp';
import { hexlify } from 'ethers/lib/utils';
import { toActiveUser, useUser } from '~/queries/user/useUser.api';
import { Appbar, Button, Dialog, Text } from 'react-native-paper';
import {
  SigningRequest,
  toTypedData,
  TypedData,
} from '~/util/walletconnect/methods/signing';
import { DialogRoot } from '~/components/DialogRoot';
import { ProposerDetails } from '../session-proposal/ProposerDetails';
import { CHAIN_ID } from '@network/provider';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import useAsyncEffect from 'use-async-effect';
import { showWarning } from '~/provider/SnackbarProvider';
import { SigningData } from './SigningData';
import { Topic, useSession } from '~/util/walletconnect/useTopic';
import { Box } from '~/components/layout/Box';
import { Actions } from '~/components/layout/Actions';
import { Addr } from '~/components/addr/Addr';
import { makeStyles } from '@theme/makeStyles';

export interface SignScreenParams {
  topic: Topic;
  id: number;
  request: SigningRequest;
}

export type SignScreenProps = RootNavigatorScreenProps<'Sign'>;

export const SignScreen = ({ navigation, route }: SignScreenProps) => {
  const { id, request } = route.params;
  const styles = useStyles();
  const device = useDevice();
  const topic = useSession(route.params.topic);

  const [account, data] = useMemo(
    () =>
      match<SigningRequest, [Address, string | TypedData]>(request)
        .with({ method: 'personal_sign' }, ({ params: [message, account] }) => [
          account,
          message,
        ])
        .with({ method: 'eth_sign' }, ({ params }) => params)
        .with(
          { method: 'eth_signTypedData' },
          { method: 'eth_signTypedData_v3' },
          { method: 'eth_signTypedData_v4' },
          ({ params: [account, typedDataJson] }) => [
            account,
            toTypedData(typedDataJson),
          ],
        )
        .exhaustive(),
    [request],
  );

  const [user] = useUser({
    account,
    addr: device.address,
  });

  const promisedUserSignature = useMemo(async () => {
    const deviceSignature = await match(data)
      .when(
        (data): data is string => typeof data === 'string',
        (message) => device.signMessage(message),
      )
      .when(
        (data): data is TypedData => typeof data === 'object',
        (typedData) => {
          // Ensure signing domain chain matches
          if (
            typedData.domain.chainId !== undefined &&
            !BigNumber.from(typedData.domain.chainId).eq(CHAIN_ID())
          )
            return null;

          return device._signTypedData(
            typedData.domain,
            typedData.types,
            typedData.message,
          );
        },
      )
      .exhaustive();

    if (!deviceSignature) return null;

    return createUserSignature(toActiveUser(user), [
      {
        approver: device.address,
        signature: deviceSignature,
      },
    ]);
  }, [data, device, user]);

  const reject = useCallback(
    (error: WcErrorKey) => {
      topic.reject(id, error);
      navigation.goBack();
    },
    [id, navigation, topic],
  );

  const rejectAsInvalid = useCallback(() => {
    showWarning('Invalid signing request was rejected');
    reject('UNSUPPORTED_CHAINS');
  }, [reject]);

  useAsyncEffect(
    async (isMounted) => {
      const userSignature = await promisedUserSignature;
      if (isMounted() && !userSignature) rejectAsInvalid();
    },
    [promisedUserSignature, rejectAsInvalid],
  );

  const sign = async () => {
    const userSignature = await promisedUserSignature;
    if (!userSignature) return rejectAsInvalid();

    topic.respond(id, hexlify(userSignature));
    navigation.goBack();
  };

  console.log(data);

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
        <SigningData data={data} />
      </Box>

      <Actions>
        <Button onPress={() => reject('USER_REJECTED')}>Reject</Button>
        <Button mode="contained" onPress={sign}>
          Sign
        </Button>
      </Actions>
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
