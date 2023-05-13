import { useAccount } from '@api/account';
import { useApprover } from '@network/useApprover';
import { makeStyles } from '@theme/makeStyles';
import { asAddress, asHex, encodeAccountSignature, isHex } from 'lib';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { Button } from '~/components/Button';
import { DataView } from '~/components/DataView/DataView';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Actions } from '~/components/layout/Actions';
import { Sheet } from '~/components/sheet/Sheet';
import { PeerHeader } from '~/components/walletconnect/PeerHeader';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import {
  asWalletConnectError,
  asWalletConnectResult,
  useWalletConnect,
} from '~/util/walletconnect';
import { SigningRequest, isTypedData, normalizeSigningRequest } from '~/util/walletconnect/methods';

export interface SignSheetParams {
  topic: string;
  id: number;
  request: SigningRequest;
}

export type SignSheetProps = StackNavigatorScreenProps<'Sign'>;

export const SignSheet = ({ route, navigation: { goBack } }: SignSheetProps) => {
  const { topic, id, request } = route.params;
  const styles = useStyles();
  const approver = useApprover();
  const client = useWalletConnect();
  const session = client.session.get(topic);
  const { account: accountAddress, message } = normalizeSigningRequest(request);
  const account = useAccount(accountAddress);

  const policy = account.policies.find((p) => {
    const approvers = p.state?.approvers;
    return approvers?.size === 1 && approvers.has(asAddress(approver.address));
  })?.state;

  // TODO: verify typed data message chain is from one of the session's chains

  const reject = () => {
    client.respond({ topic, response: asWalletConnectError(id, 'USER_REJECTED') });
    goBack();
  };

  const signature = useMemo(
    () =>
      policy &&
      (async () => {
        const signature = await match(message)
          .when(isHex, async (message) => asHex(await approver.signMessage(message)))
          .when(isTypedData, async (message) =>
            asHex(await approver._signTypedData(message.domain, message.types, message.message)),
          )
          .exhaustive();

        return encodeAccountSignature(policy, [
          { approver: asAddress(approver.address), signature, type: 'secp256k1' },
        ]);
      })(),
    [message, approver],
  );

  const sign = async () => {
    await client.respond({ topic, response: asWalletConnectResult(id, await signature) });
    goBack();
  };

  return (
    <Sheet onClose={reject}>
      <PeerHeader peer={session.peer.metadata}>
        {'wants '}
        <Text variant="headlineMedium">
          <AddressLabel address={account.address} />
        </Text>
        {' to sign'}
      </PeerHeader>

      <DataView>{message}</DataView>

      {!policy && (
        <Text variant="titleSmall" style={styles.policyError}>
          Only sole-approver policy signing is currently supported
        </Text>
      )}

      <Actions>
        <Button mode="contained" disabled={!signature} onPress={sign}>
          Sign
        </Button>
      </Actions>
    </Sheet>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  policyError: {
    color: colors.error,
    marginVertical: 8,
    marginHorizontal: 16,
    textAlign: 'center',
    flex: 1,
  },
}));
