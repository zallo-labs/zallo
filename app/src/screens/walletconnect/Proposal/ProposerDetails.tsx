import { ExternalLinkIcon } from '@theme/icons';
import { IconButton, Text } from 'react-native-paper';
import { Item, ItemProps } from '~/components/item/Item';
import * as WebBrowser from 'expo-web-browser';
import UriImage from '~/components/UriImage';
import { WcProposer } from '~/util/walletconnect/useWalletConnectSessions';

export interface ProposerDetailsProps extends ItemProps {
  proposer: WcProposer;
}

export const ProposerDetails = ({
  proposer: p,
  ...itemProps
}: ProposerDetailsProps) => (
  <Item
    {...(p.icons.length && {
      Left: <UriImage uri={p.icons} />,
    })}
    Main={[
      <Text variant="titleMedium">{p.name || p.url}</Text>,
      p.description && <Text variant="bodyMedium">{p.description}</Text>,
    ]}
    {...(p.url && {
      Right: (
        <IconButton
          icon={ExternalLinkIcon}
          onPress={() => WebBrowser.openBrowserAsync(p.url)}
        />
      ),
    })}
    {...itemProps}
  />
);
