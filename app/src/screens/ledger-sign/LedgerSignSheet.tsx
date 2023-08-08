import { LedgerLogo, materialIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ICON_SIZE } from '@theme/paper';
import { Address, Hex, isAddress } from 'lib';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { DeviceId } from 'react-native-ble-plx';
import { ActivityIndicator, Text } from 'react-native-paper';
import { P, match } from 'ts-pattern';
import useAsyncEffect from 'use-async-effect';
import { SuccessIcon } from '~/components/SuccessIcon';
import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { EventEmitter } from '~/util/EventEmitter';
import { useLedger } from '~/components/ledger/useLedger';
import { Result } from 'neverthrow';
import { Button } from '~/components/Button';
import { EIP712Message } from '@ledgerhq/types-live';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';

const RejectedIcon = materialIcon('error-outline');

export interface LedgerSignatureEvent {
  address: Address;
  signature: Hex;
}

export const LEDGER_ADDRESS_EMITTER = new EventEmitter<Address>('Ledger::address');
const LEDGER_SIGNATURE_EMITTER = new EventEmitter<LedgerSignatureEvent>('Ledger::sign');
export const useSignWithLedger = LEDGER_SIGNATURE_EMITTER.createUseSelect('LedgerSign');

const LEDGER_LAZY_MESSAGE_EMITTER = new EventEmitter<SignContent>('Ledger::signContent');

export const getLedgerLazySignature = async (content: SignContent) => {
  const p = LEDGER_SIGNATURE_EMITTER.getEvent();
  LEDGER_LAZY_MESSAGE_EMITTER.emit(content);
  return p;
};

type SignContent = PersonalMessage | EIP712Message;

type PersonalMessage = string;

const isPersonalMessage = (c: SignContent): c is PersonalMessage => typeof c === 'string';
const isEip712Message = (c: SignContent): c is EIP712Message => typeof c === 'object';

const Query = gql(/* GraphQL */ `
  query LedgerSignSheet($approver: Address!) {
    approver(input: { address: $approver }) {
      id
      name
      ...UseLedger_UserApprover
    }
  }
`);

export type LedgerSignSheetParams = {
  device: DeviceId | Address;
  name?: string;
  content: SignContent | undefined;
};

export type LedgerSignSheetProps = StackNavigatorScreenProps<'LedgerSign'>;

export function LedgerSignSheet({
  route: { params },
  navigation: { goBack },
}: LedgerSignSheetProps) {
  const styles = useStyles();

  const approver = useQuery(
    Query,
    { approver: params.device as Address },
    { pause: !isAddress(params.device) },
  ).data?.approver;
  const result = useLedger(approver ?? params.device);

  const lazyMessage = useRef<SignContent | undefined>();
  const [signature, setSignature] = useState<Result<Hex, 'user-rejected'> | undefined>();

  useAsyncEffect(
    async (isMounted) => {
      if (!result.isOk() || signature !== undefined) return;

      const ledger = result.value;

      LEDGER_ADDRESS_EMITTER.emit(ledger.address);

      const content =
        params.content || (lazyMessage.current ??= await LEDGER_LAZY_MESSAGE_EMITTER.getEvent());

      const sig = await match(content)
        .when(isPersonalMessage, ledger.signMessage)
        .when(isEip712Message, ledger.signEip712Message)
        .exhaustive();

      if (!isMounted()) return;

      setSignature(sig);

      if (sig.isOk()) {
        setTimeout(
          () => LEDGER_SIGNATURE_EMITTER.emit({ address: ledger.address, signature: sig.value }),
          2000,
        );
      }
    },
    [result, signature],
  );

  return (
    <Sheet handle={false} onClose={goBack} contentContainerStyle={{ paddingBottom: 16 }}>
      <View style={styles.container}>
        <LedgerLogo width={144} height={48} />

        <Text variant="headlineSmall" style={styles.name}>
          {approver.name || params.name || params.device}
        </Text>
      </View>

      <View style={styles.stateContainer}>
        {signature ? (
          signature.match(
            () => <SuccessIcon size={ICON_SIZE.extraLarge} />,
            () => (
              <>
                <RejectedIcon size={ICON_SIZE.large} style={styles.error} />
                <Text variant="labelLarge" style={styles.error}>
                  Signature cancelled on device
                </Text>
                <Button
                  mode="contained"
                  style={styles.action}
                  onPress={() => setSignature(undefined)}
                >
                  Retry
                </Button>
              </>
            ),
          )
        ) : (
          <>
            <ActivityIndicator size={ICON_SIZE.medium} />

            {result.match(
              () => (
                <>
                  <Text variant="labelLarge">Awaiting signature...</Text>
                  <Text style={styles.hint}>Sign the message on your Ledger</Text>
                </>
              ),
              (error) =>
                match(error)
                  .with({ type: 'permissions-required' }, ({ requestPermissions }) => (
                    <>
                      <Text variant="titleMedium">
                        Bluetooth permissions are required to connect
                      </Text>
                      <Button mode="contained" style={styles.action} onPress={requestPermissions}>
                        Grant
                      </Button>
                    </>
                  ))
                  .with(P.union('find-failed', 'connection-failed'), () => (
                    <>
                      <Text variant="labelLarge">Connecting...</Text>
                      <Text style={styles.hint}>Unlock your Ledger and enable bluetooth</Text>
                    </>
                  ))
                  .with('locked', () => (
                    <>
                      <Text variant="labelLarge">Connecting...</Text>
                      <Text style={styles.hint}>Unlock your Ledger</Text>
                    </>
                  ))
                  .with('eth-app-closed', () => (
                    <>
                      <Text variant="labelLarge">Connecting...</Text>
                      <Text style={styles.hint}>Open the Ethereum app on your Ledger</Text>
                    </>
                  ))
                  .exhaustive(),
            )}
          </>
        )}
      </View>
    </Sheet>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  name: {
    color: colors.primary,
  },
  stateContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
  },
  hint: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
}));
