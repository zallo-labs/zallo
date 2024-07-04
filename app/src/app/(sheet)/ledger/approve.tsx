import { LedgerLogo, materialIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { Address, Hex, isAddress } from 'lib';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import useAsyncEffect from 'use-async-effect';
import { SuccessIcon } from '#/SuccessIcon';
import { Sheet } from '#/sheet/Sheet';
import { useLedger } from '~/hooks/ledger/useLedger';
import { Result } from 'neverthrow';
import { Button } from '#/Button';
import { TypedDataDefinition } from 'viem';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { Subject, firstValueFrom, skip } from 'rxjs';
import { useGetEvent } from '~/hooks/useGetEvent';
import { createStyles, useStyles } from '@theme/styles';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { approve_LedgerApproveSheetQuery } from '~/api/__generated__/approve_LedgerApproveSheetQuery.graphql';

const RejectedIcon = materialIcon('error-outline');

export interface LedgerSignatureEvent {
  address: Address;
  signature: Hex;
}

const LEDGER_ADDRESS = new Subject<Address>();
const CONTENT_TO_SIGN = new Subject<SignContent>();
const LEDGER_SIGNATURE = new Subject<LedgerSignatureEvent>();

export function useGetLedgerApprover() {
  const getEvent = useGetEvent();

  return async (params: z.infer<typeof LedgerApproveParams>) => {
    const r = getEvent({ pathname: `/ledger/approve`, params }, LEDGER_SIGNATURE);

    return {
      address: await firstValueFrom(LEDGER_ADDRESS),
      signTypedData: async (typedData: TypedDataDefinition) => {
        CONTENT_TO_SIGN.next(typedData);
        return (await r)?.signature;
      },
      signMessage: async ({ message }: { message: string }) => {
        CONTENT_TO_SIGN.next(message);
        return (await r)?.signature;
      },
    };
  };
}

type SignContent = PersonalMessage | TypedDataDefinition;
type PersonalMessage = string;

const isPersonalMessage = (c: SignContent): c is PersonalMessage => typeof c === 'string';
const isEip712Message = (c: SignContent): c is TypedDataDefinition => typeof c === 'object';

const Query = graphql`
  query approve_LedgerApproveSheetQuery($approver: Address!, $skip: Boolean!) {
    approver(input: { address: $approver }) @skip(if: $skip) {
      id
      label
      ...useLedger_approver
    }
  }
`;

const LedgerApproveParams = z.object({
  device: z.string(),
  name: z.string().optional(),
});

export default function LedgerApproveSheet() {
  const params = useLocalParams(LedgerApproveParams);
  const { styles } = useStyles(stylesheet);

  const { approver } = useLazyLoadQuery<approve_LedgerApproveSheetQuery>(Query, {
    approver: params.device as Address,
    skip: !isAddress(params.device),
  });
  const result = useLedger(approver ?? params.device);

  const content = useRef<SignContent | undefined>();
  const [signature, setSignature] = useState<Result<Hex, 'user-rejected'> | undefined>();

  useAsyncEffect(
    async (isMounted) => {
      if (!result.isOk() || signature !== undefined) return;

      const ledger = result.value;
      LEDGER_ADDRESS.next(ledger.address);

      content.current ??= await firstValueFrom(CONTENT_TO_SIGN);

      const sig = await match(content.current)
        .when(isPersonalMessage, ledger.signMessage)
        .when(isEip712Message, ledger.signEip712Message)
        .exhaustive();

      if (!isMounted()) return;

      setSignature(sig);

      if (sig.isOk()) {
        content.current = undefined;
        setTimeout(
          () => LEDGER_SIGNATURE.next({ address: ledger.address, signature: sig.value }),
          2000,
        );
      }
    },
    [result, signature],
  );

  return (
    <Sheet handle={false}>
      <View style={styles.container}>
        <LedgerLogo style={styles.logo} />

        <Text variant="headlineSmall" style={styles.name}>
          {approver?.label || params.name || params.device}
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
                  .with('finding', () => (
                    <>
                      <Text variant="labelLarge">Finding...</Text>
                      <Text style={styles.hint}>Unlock your Ledger and enable bluetooth</Text>
                    </>
                  ))
                  .with('connecting', () => (
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
                  .with('waiting-for-app', () => (
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

const stylesheet = createStyles(({ colors }) => ({
  container: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logo: {
    width: 144,
    height: 48,
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

export { ErrorBoundary } from '#/ErrorBoundary';
