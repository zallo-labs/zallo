import { ExternalLinkIcon } from '@theme/icons';
import { ProposalTypes } from '@walletconnect/types';
import { IconButton, Text } from 'react-native-paper';
import { Item, ItemProps } from '~/components/item/Item';
import * as WebBrowser from 'expo-web-browser';
import UriImage from '~/components/UriImage';

export interface ProposerDetailsProps extends ItemProps {
  proposer: ProposalTypes.Struct['proposer'];
}

export const ProposerDetails = ({
  proposer: { metadata: m },
  ...itemProps
}: ProposerDetailsProps) => (
  <Item
    {...(m.icons.length && {
      Left: <UriImage uri={m.icons} />,
    })}
    Main={[
      <Text variant="titleMedium">{m.name || m.url}</Text>,
      m.description && <Text variant="bodyMedium">{m.description}</Text>,
    ]}
    {...(m.url && {
      Right: (
        <IconButton
          icon={ExternalLinkIcon}
          onPress={() => WebBrowser.openBrowserAsync(m.url)}
        />
      ),
    })}
    {...itemProps}
  />
);
