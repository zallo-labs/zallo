import { Verify } from '@walletconnect/types';
import { atom, useAtomValue } from 'jotai';
import { createStyles, useStyles } from '@theme/styles';
import { useCallback } from 'react';
import { useSetImmerAtom } from 'jotai-immer';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { materialCommunityIcon } from '@theme/icons';

const WarningIcon = materialCommunityIcon('alert-circle');
const DangerIcon = materialCommunityIcon('alert');

export interface DappRequestId {
  topic: string;
  id: number;
}

export type VerificationStatus = 'safe' | 'unverified' | 'domain-mismatch' | 'malicious';

export interface DappVerificationProps {
  request: DappRequestId;
  style?: StyleProp<ViewStyle>;
}

export function DappVerification({ request, style }: DappVerificationProps) {
  const status = useDappVerification(request);
  const { styles } = useStyles(stylesheet, {
    status: status === 'unverified' ? 'warning' : 'danger',
  });

  if (status === 'safe') return;

  return (
    <Surface elevation={0} style={[styles.surface, style]}>
      {match(status)
        .with('unverified', () => (
          <>
            <View style={styles.headlineContainer}>
              <WarningIcon size={styles.icon.width} color={styles.headline.color} />

              <Text variant="titleMedium" style={styles.headline}>
                Unknown dapp
              </Text>
            </View>

            <Text>
              <Text variant="bodyMedium" style={styles.description}>
                {"The domain for this dapp couldn't be verified. Check the domain carefully and "}
              </Text>

              <Text variant="labelLarge" style={styles.description}>
                proceed with caution
              </Text>
            </Text>
          </>
        ))
        .with('domain-mismatch', () => (
          <>
            <View style={styles.headlineContainer}>
              <DangerIcon size={styles.icon.width} color={styles.headline.color} />

              <Text variant="titleMedium" style={styles.headline}>
                Potential phishing attack
              </Text>
            </View>

            <Text>
              <Text variant="bodyMedium" style={styles.description}>
                {"The domain for this dapp doesn't match the sender of the request. "}
              </Text>

              <Text variant="labelLarge" style={styles.description}>
                We recommend to leave immediately
              </Text>
            </Text>
          </>
        ))
        .with('malicious', () => (
          <>
            <View style={styles.headlineContainer}>
              <DangerIcon size={styles.icon.width} color={styles.headline.color} />

              <Text variant="titleMedium" style={styles.headline}>
                Malicious dapp
              </Text>
            </View>

            <Text>
              <Text variant="bodyMedium" style={styles.description}>
                {'The dapp has been flagged as malicious by multiple security providers. '}
              </Text>

              <Text variant="labelLarge" style={styles.description}>
                We recommend to leave immediately
              </Text>
            </Text>
          </>
        ))
        .exhaustive()}
    </Surface>
  );
}

const stylesheet = createStyles(({ colors, corner, iconSize }) => ({
  component: {
    variants: {
      type: {
        a: {
          color: 'red' as const,
        },
        b: {
          color: 'blue' as const,
        },
      }
    }
  },
  surface: {
    gap: 4,
    padding: 16,
    borderRadius: corner.l,
    variants: {
      status: {
        warning: {
          backgroundColor: colors.warningContainer,
        },
        danger: {
          backgroundColor: colors.errorContainer,
        },
      },
    },
  },
  headlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headline: {
    variants: {
      status: {
        warning: {
          color: colors.warning as string, // to avoid 'never' type
        },
        danger: {
          color: colors.error,
        },
      },
    },
  },
  description: {
    variants: {
      status: {
        warning: {
          color: colors.onWarningContainer,
        },
        danger: {
          color: colors.onErrorContainer,
        },
      },
    },
  },
  icon: {
    width: iconSize.small,
  },
}));

const statuses = atom<Map<string, VerificationStatus>>(new Map());

function id(request: DappRequestId) {
  return `${request.topic}:${request.id}`;
}

export function useDappVerification(request: DappRequestId) {
  return useAtomValue(statuses).get(id(request)) || 'unverified';
}

export function useVerifyDapp() {
  const update = useSetImmerAtom(statuses);

  return useCallback(
    (request: DappRequestId, context: Verify.Context['verified']) =>
      update((draft) => {
        const status = match(context)
          .returnType<VerificationStatus>()
          .with({ isScam: true }, () => 'malicious')
          .with({ validation: 'VALID' }, () => 'safe')
          .with({ validation: 'UNKNOWN' }, () => 'unverified')
          .with({ validation: 'INVALID' }, () => 'domain-mismatch')
          .exhaustive();

        draft.set(id(request), status);
      }),
    [update],
  );
}
