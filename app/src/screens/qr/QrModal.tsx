import QRCode from 'react-native-qrcode-svg';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Screen } from '~/components/layout/Screen';
import { makeStyles } from '@theme/makeStyles';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, ShareIcon, materialCommunityIcon } from '@theme/icons';
import { Actions } from '~/components/layout/Actions';
import { Share, View } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { buildAddressLink } from '~/util/addressLink';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Blur } from '~/components/Blur';
import { Button } from '~/components/Button';
import { gql } from '@api/gen';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { QrModalDocument } from '@api/generated';
import { QrModalQuery, QrModalQueryVariables } from '@api/gen/graphql';

gql(/* GraphQL */ `
  query QrModal($account: Address!) {
    requestableTokens(input: { account: $account })
  }
`);

const RequestTokens = gql(/* GraphQL */ `
  mutation QrModal_RequestTokens($account: Address!) {
    requestTokens(input: { account: $account })
  }
`);

const FaucetIcon = materialCommunityIcon('water');

export interface QrModalParams {
  address: Address;
}

export type QrModalProps = StackNavigatorScreenProps<'QrModal'>;

export const QrModal = withSuspense(({ route, navigation: { goBack } }: QrModalProps) => {
  const { address } = route.params;
  const styles = uesStyles();
  const requestTokens = useMutation(RequestTokens)[1];

  const { requestableTokens } = useQuery<QrModalQuery, QrModalQueryVariables>(QrModalDocument, {
    account: address,
  }).data;

  const share = () => {
    const link = buildAddressLink(address);
    Share.share({ url: link, message: link });
  };

  return (
    <Blur>
      <Screen topInset>
        <IconButton mode="contained-tonal" icon={CloseIcon} style={styles.close} onPress={goBack} />

        <View style={styles.qrContainer}>
          <Text variant="headlineLarge" style={styles.name}>
            <AddressLabel address={address} />
          </Text>

          <Surface style={styles.qrSurface}>
            <QRCode
              value={address}
              color={styles.qr.color}
              size={styles.qr.fontSize}
              backgroundColor="transparent"
              ecl="M"
              enableLinearGradient
              linearGradient={[styles.primary.color, styles.tertiary.color]}
            />
          </Surface>
        </View>

        <Actions>
          {requestableTokens.length > 0 && (
            <Button
              mode="contained-tonal"
              icon={FaucetIcon}
              onPress={() => requestTokens({ account: address })}
            >
              Request testnet tokens
            </Button>
          )}

          <Button mode="contained" icon={ShareIcon} onPress={share}>
            Share
          </Button>
        </Actions>
      </Screen>
    </Blur>
  );
}, Blur);

const uesStyles = makeStyles(({ colors, window }) => ({
  close: {
    marginHorizontal: 16,
  },
  name: {
    textAlign: 'center',
    color: colors.onScrim,
  },
  qrContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  qrSurface: {
    padding: 16,
    borderRadius: 16,
  },
  qr: {
    fontSize: window.width - 64,
    color: colors.onSurface,
  },
  primary: {
    color: colors.primary,
  },
  tertiary: {
    color: colors.tertiary,
  },
  requestButton: {
    color: colors.inverseOnSurface,
  },
}));
