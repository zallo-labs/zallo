import { useApprover } from '@network/useApprover';
import { ApprovalsRule, asAddress, asHex, encodeAccountSignature, Hex, Policy } from 'lib';
import { match } from 'ts-pattern';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
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
import { showError, showWarning } from '~/provider/SnackbarProvider';
import { Eip712TypedData } from './Eip712TypedData';
import { Box } from '~/components/layout/Box';
import { Actions } from '~/components/layout/Actions';
import { Addr } from '~/components/addr/Addr';
import { makeStyles } from '@theme/makeStyles';
import { AccountIdlike, useAccount } from '@api/account';
import {
  asWalletConnectError,
  useWalletConnect,
  asWalletConnectResult,
  WalletConnectErrorKey,
} from '~/util/walletconnect';

interface SigningError {
  error: WalletConnectErrorKey;
}

const isSigningError = (v: unknown): v is SigningError =>
  typeof v === 'object' && v !== null && 'error' in v;

export interface SignScreenParams {
  topic: string;
  id: number;
  request: SigningRequest;
}

export type SignScreenProps = StackNavigatorScreenProps<'Sign'>;

export const SignScreen = ({ navigation, route }: SignScreenProps) => {
  const { topic, id, request } = route.params;
  const styles = useStyles();
  const approver = useApprover();
  const client = useWalletConnect();

  const [accountId, data] = useMemo(
    () =>
      match<SigningRequest, [AccountIdlike, string | Eip712TypedDomainData]>(request)
        .with({ method: 'personal_sign' }, ({ params: [message, account] }) => [account, message])
        .with({ method: 'eth_sign' }, ({ params: [account, message] }) => [account, message])
        .with(
          { method: 'eth_signTypedData' },
          { method: 'eth_signTypedData_v3' },
          { method: 'eth_signTypedData_v4' },
          ({ params: [account, typedDataJson] }) => [account, toTypedData(typedDataJson)],
        )
        .exhaustive(),
    [request],
  );
  const account = useAccount(accountId);
  const approverOnlyPolicy = (() => {
    const p = account.policies.find((p) => {
      const approvers =
        p.active instanceof Policy ? p.active.rules.get(ApprovalsRule)?.approvers : undefined;
      return approvers?.size === 1 && approvers.has(asAddress(approver.address));
    });
    return p?.active && p.active instanceof Policy ? p.active! : undefined;
  })();

  const reject = useCallback(
    async (error: WalletConnectErrorKey) => {
      await client.respond({ topic, response: asWalletConnectError(id, error) });
      navigation.goBack();
    },
    [client, id, navigation, topic],
  );

  const promisedAccountSignature = useMemo(async (): Promise<
    Hex | { error: WalletConnectErrorKey }
  > => {
    const approverSignature = await match(data)
      .when(
        (data): data is string => typeof data === 'string',
        async (message) => asHex(await approver.signMessage(message)),
      )
      .when(
        (data): data is Eip712TypedDomainData => typeof data === 'object',
        async (typedData) => {
          // Ensure signing domain chain matches
          if (
            typedData.domain.chainId !== undefined &&
            !BigNumber.from(typedData.domain.chainId).eq(CHAIN_ID())
          )
            return { error: 'UNSUPPORTED_CHAINS' } as const;

          return asHex(
            await approver._signTypedData(typedData.domain, typedData.types, typedData.message),
          );
        },
      )
      .exhaustive();

    if (isSigningError(approverSignature)) return approverSignature;

    if (!approverOnlyPolicy) {
      showError('Signing currently requires a policy you are the sole approver'); // TODO: implement multi-approver signing
      return { error: 'UNSUPPORTED_METHODS' };
    }

    return encodeAccountSignature(approverOnlyPolicy, [
      { approver: asAddress(approver.address), signature: approverSignature },
    ]);
  }, [data, approverOnlyPolicy, approver]);

  const validateSignature = useCallback(
    (signature: Hex | SigningError): signature is Hex => {
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
      await client.respond({ topic, response: asWalletConnectResult(id, signature) });
      navigation.goBack();
    }
  };

  return (
    <Box flex={1}>
      <Appbar.Header>
        <Appbar.Content title="Signing Request" />
      </Appbar.Header>

      <Box flex={1} mx={2}>
        <ProposerDetails proposer={client.session.get(topic).peer.metadata} />

        <Text variant="headlineSmall" style={styles.signTitle}>
          {'Wants '}
          <Text variant="headlineSmall" style={styles.accountName}>
            <Addr addr={account.id} />
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
