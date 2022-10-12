import { useDevice } from '@network/useDevice';
import { Address, createUserSignature } from 'lib';
import { match } from 'ts-pattern';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WcErrorKey } from '~/util/walletconnect/jsonRcp';
import { hexlify } from 'ethers/lib/utils';
import { toActiveUser, useUser } from '~/queries/user/useUser.api';
import { Button, Dialog } from 'react-native-paper';
import {
  SigningRequest,
  toTypedData,
  TypedData,
} from '~/util/walletconnect/methods/signing';
import { DialogRoot } from '~/components/DialogRoot';
import { ProposerDetails } from '../Proposal/ProposerDetails';
import { CHAIN_ID } from '@network/provider';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import useAsyncEffect from 'use-async-effect';
import { showWarning } from '~/provider/SnackbarProvider';
import { SigningData } from './SigningData';
import { useWalletConnect } from '~/util/walletconnect/useWalletConnect';
import { useWalletConnectSessions } from '~/util/walletconnect/useWalletConnectSessions';

export interface SessionSignScreenParams {
  topicOrUri: string;
  id: number;
  request: SigningRequest;
}

export type SessionSignScreenProps = RootNavigatorScreenProps<'SessionSign'>;

export const SessionSignScreen = ({
  navigation,
  route,
}: SessionSignScreenProps) => {
  const { topicOrUri, id, request } = route.params;
  const device = useDevice();
  const wc = useWalletConnect();
  const proposer = useWalletConnectSessions().get(topicOrUri)!.proposer;

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
          // Reject domains from another chain
          // TODO: walletconnect - re-enable chain id check
          // if (
          //   typedData.domain.chainId !== undefined &&
          //   !BigNumber.from(typedData.domain.chainId).eq(CHAIN_ID())
          // )
          //   return null;

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
      wc.request.reject(topicOrUri, id, error);
      navigation.goBack();
    },
    [id, navigation, topicOrUri, wc.request],
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

    wc.request.approve(topicOrUri, id, hexlify(userSignature));
    navigation.goBack();
  };

  return (
    <DialogRoot>
      <Dialog.Title>Signing request</Dialog.Title>

      <Dialog.Content>
        <ProposerDetails proposer={proposer} padding="vertical" />
        <SigningData data={data} />
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={() => reject('USER_REJECTED')}>Reject</Button>
        <Button onPress={sign}>Sign</Button>
      </Dialog.Actions>
    </DialogRoot>
  );
};
