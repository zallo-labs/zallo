import { FragmentType, gql, useFragment } from '@api/generated';
import { IconProps, materialIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image } from 'expo-image';

export const GenericMessageIcon = materialIcon('mail');

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
  const { styles } = useStyles(stylesheet);
  const p = useFragment(MessageProposal, proposalFragment);

  return p.iconUri ? (
    <Image source={{ uri: p.iconUri }} style={styles.icon} {...iconProps} />
  ) : (
    <GenericMessageIcon {...iconProps} />
  );
}

const stylesheet = createStyles(({ iconSize, corner }) => ({
  icon: {
    width: iconSize.medium,
    height: iconSize.medium,
    borderRadius: corner.l,
  },
}));
