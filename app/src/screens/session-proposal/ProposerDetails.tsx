import { Text } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import UriImage from '~/components/UriImage';
import { WcProposer } from '~/util/walletconnect/useWalletConnectSessions';
import { Box } from '~/components/layout/Box';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { Container } from '~/components/layout/Container';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@theme/paper';

export const UNNAMED_DAPP_NAME = 'Unnamed DApp';

export interface ProposerDetailsProps {
  proposer: WcProposer;
  style?: StyleProp<ViewStyle>;
}

export const ProposerDetails = ({ proposer: p, style }: ProposerDetailsProps) => {
  const { iconSize } = useTheme();

  const name = p.name || UNNAMED_DAPP_NAME;

  return (
    <TouchableOpacity onPress={p.url ? () => WebBrowser.openBrowserAsync(p.url) : undefined}>
      <Container vertical alignItems="center" separator={<Box mt={2} />} style={style}>
        {p.icons.length ? (
          <UriImage uri={p.icons} size={iconSize.large} />
        ) : (
          <LabelIcon label={name} size={iconSize.large} />
        )}

        <Text variant="displaySmall" style={styles.text}>
          {name}
        </Text>

        {p.description && (
          <Text variant="bodyMedium" style={styles.text}>
            {p.description}
          </Text>
        )}
      </Container>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});
