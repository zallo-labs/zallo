import { LedgerLogo, materialIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ICON_SIZE } from '@theme/paper';
import { Address, Hex, asHex } from 'lib';
import { useState } from 'react';
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
import { Result, ResultAsync } from 'neverthrow';
import { Button } from '~/components/Button';

const RejectedIcon = materialIcon('error-outline');

const isPersonalMessage = (c: SignContent): c is PersonalMessage => 'message' in c;
const isEip712Message = (c: SignContent): c is Eip712Message => 'hashStructMessage' in c;

export interface LedgerSignatureEvent {
  device: DeviceId;
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

type SignContent = PersonalMessage | Eip712Message;

interface PersonalMessage {
  message: string;
}

interface Eip712Message {
  domainSeparator: string;
  hashStructMessage: string;
}

export type LedgerSignSheetParams = {
  device: DeviceId;
  name?: string;
  content: SignContent | undefined;
};

export type LedgerSignSheetProps = StackNavigatorScreenProps<'LedgerSign'>;

export function LedgerSignSheet({
  route: { params },
  navigation: { goBack },
}: LedgerSignSheetProps) {
  const styles = useStyles();
  const result = useLedger(params.device);

  // TODO: handle disconnect after getting lazy message, but before signing

  const [signature, setSignature] = useState<Result<Hex, 'user-rejected'> | undefined>();
  const [_attempt, setAttempt] = useState(0);
  useAsyncEffect(
    async (isMounted) => {
      if (!result.isOk()) return;

      const ledger = result.value;

      LEDGER_ADDRESS_EMITTER.emit(ledger.address);

      const sig = await ResultAsync.fromPromise(
        match(params.content ?? (await LEDGER_LAZY_MESSAGE_EMITTER.getEvent()))
          .when(isPersonalMessage, (c) => ledger.signMessage(c.message))
          .when(isEip712Message, async (c) => asHex('0x'))
          .exhaustive(),
        () => 'user-rejected' as const,
      );

      if (isMounted()) {
        setSignature(sig);

        if (sig.isOk()) {
          setTimeout(
            () =>
              LEDGER_SIGNATURE_EMITTER.emit({
                device: params.device,
                address: ledger.address,
                signature: sig.value,
              }),
            2000,
          );
        }
      }
    },
    [result],
  );

  return (
    <Sheet handle={false} onClose={goBack} contentContainerStyle={{ paddingBottom: 16 }}>
      <View style={styles.container}>
        <LedgerLogo width={144} height={48} />

        <Text variant="headlineSmall" style={styles.name}>
          {params.name || params.device}
        </Text>
      </View>

      <View style={styles.stateContainer}>
        {signature ? (
          signature.match(
            () => <SuccessIcon size={80} />,
            () => (
              <>
                <RejectedIcon size={ICON_SIZE.large} style={styles.error} />
                <Text variant="labelLarge" style={styles.error}>
                  Rejected
                </Text>
                <Button
                  mode="contained"
                  style={styles.action}
                  onPress={() => setAttempt((attempt) => attempt + 1)}
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
