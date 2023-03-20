import { Text } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { WalletConnectPeer } from '~/util/walletconnect/types';
import { PeerItem } from '../sessions/PeerItem';

export const UNNAMED_DAPP_NAME = 'Unnamed DApp';

export interface ProposerDetailsProps {
  proposer: WalletConnectPeer;
  style?: StyleProp<ViewStyle>;
}

export const ProposerDetails = ({ proposer: p, style }: ProposerDetailsProps) => {
  return (
    <TouchableOpacity onPress={p.url ? () => WebBrowser.openBrowserAsync(p.url) : undefined}>
      <Container vertical alignItems="center" separator={<Box mt={2} />} style={style}>
        <PeerItem peer={p} />

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
