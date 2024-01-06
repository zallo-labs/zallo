import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { IconProps, materialCommunityIcon } from '~/util/theme/icons';
import { ICON_SIZE } from '~/util/theme/paper';

const SignatureIcon = materialCommunityIcon('signature');

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageIcon_MessageProposal on Proposal {
    id
    iconUri
  }
`);

export interface MessageIconProps extends Partial<IconProps> {
  proposal: FragmentType<typeof MessageProposal>;
}

export function MessageIcon({ proposal: proposalFragment, ...iconProps }: MessageIconProps) {
  const p = useFragment(MessageProposal, proposalFragment);

  return p.iconUri ? (
    <Image source={{ uri: p.iconUri! }} style={styles.icon} {...iconProps} />
  ) : (
    <SignatureIcon {...iconProps} />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE.medium,
    height: ICON_SIZE.medium,
  },
});
